import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Select from 'react-select';

const SendMessage = () => {
  const [movies, setMovies] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [movieId, setMovieId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [userId, setUserId] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [vipRecipient, setVipRecipient] = useState('');
  const [vipPhone, setVipPhone] = useState('');
  const [vipCountryCode, setVipCountryCode] = useState('+234');
  const [vipMethod, setVipMethod] = useState('email');
  const [emailReminderRecipients, setEmailReminderRecipients] = useState('');
  const [whatsappReminderRecipients, setWhatsappReminderRecipients] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+234');
  const [reminderMessage, setReminderMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState('');
  const { authTokens } = useContext(AuthContext);

  const countryCodes = [
    { value: '+234', label: '+234 (Nigeria)' },
    { value: '+1', label: '+1 (USA)' },
    { value: '+44', label: '+44 (UK)' },
    { value: '+91', label: '+91 (India)' },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        console.log('DEBUG: Fetching movies from:', `${process.env.REACT_APP_API_URL}/movies`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/movies`, {
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('DEBUG: SendMessage movies fetched:', data);
        setMovies(Array.isArray(data) ? data : []);
        if (data.length > 0) {
          setMovieId(data[0].id);
        }
      } catch (error) {
        console.error('DEBUG: Fetch movies error:', error);
        window.Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to fetch movies: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
      }
    };

    const fetchTickets = async () => {
      try {
        console.log('DEBUG: Fetching tickets from:', `${process.env.REACT_APP_API_URL}/admin/tickets`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/tickets`, {
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('DEBUG: SendMessage tickets fetched:', data);
        if (!Array.isArray(data)) {
          console.warn('DEBUG: Tickets data is not an array:', data);
          setTickets([]);
        } else {
          setTickets(data);
          if (data.length > 0) {
            setSelectedTicket(data[0].id);
          }
        }
      } catch (error) {
        console.error('DEBUG: Fetch tickets error:', error);
        window.Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to fetch tickets: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
      }
    };

    Promise.all([fetchMovies(), fetchTickets()]);
  }, [authTokens?.token]);

  const showError = (message) => {
    window.Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#dc3545',
      background: '#fff',
      customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
    });
  };

  const showSuccess = (title, message) => {
    window.Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#007bff',
      background: '#fff',
      customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-primary' },
    });
  };

  const showConfirm = (title, text, callback) => {
    window.Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff',
      customClass: {
        popup: 'shadow-lg',
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        callback();
      }
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!movieId || !email || !phone) {
      showError('Please fill in all fields');
      return;
    }
    try {
      const fullPhone = phone.split(',').map((p) => `${countryCode}${p.trim()}`).join(',');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-event-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: parseInt(movieId), email, phone: fullPhone }),
      });
      const data = await response.json();
      if (response.status === 200) {
        const tickets = data.tickets.map((t) => `${t.email}: ${t.ticket_token}`).join('\n');
        showSuccess('Emails Sent', `Emails sent successfully:\n${tickets}`);
        setEmail('');
        setPhone('');
        setCountryCode('+234');
      } else if (response.status === 400 && data.message.includes('VIP tickets sold out')) {
        showError('VIP tickets sold out');
      } else if (response.status === 400 && data.message.includes('Number of emails and phone numbers must match')) {
        showError('Number of emails and phone numbers must match');
      } else {
        showError(data.message || 'Failed to send emails');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const handleWhatsAppSubmit = async (e) => {
    e.preventDefault();
    if (!movieId || !phone) {
      showError('Please fill in all fields');
      return;
    }
    try {
      const fullPhone = phone.split(',').map((p) => `${countryCode}${p.trim()}`).join(',');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-whatsapp`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: parseInt(movieId), phone: fullPhone }),
      });
      const data = await response.json();
      if (response.status === 200) {
        const tickets = data.tickets.map((t) => `${t.phone}: ${t.ticket_token}`).join('\n');
        showSuccess('WhatsApp Messages Sent', `Messages sent successfully:\n${tickets}`);
        setPhone('');
        setCountryCode('+234');
      } else if (response.status === 207) {
        const tickets = data.tickets.map((t) => `${t.phone}: ${t.ticket_token}`).join('\n');
        showError(`Some messages failed:\n${data.errors.join('\n')}\n\nTickets generated:\n${tickets}`);
      } else if (response.status === 400 && data.message.includes('VIP tickets sold out')) {
        showError('VIP tickets sold out');
      } else if (response.status === 404) {
        showError('Movie not found for the provided Movie ID');
      } else {
        showError(data.message || 'Failed to send WhatsApp messages');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    if (!userId) {
      showError('Please enter a User ID');
      return;
    }
    showConfirm('Delete User', 'Are you sure you want to delete this user? This will also delete their payments and tickets.', async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          showSuccess('User Deleted', 'User deleted successfully');
          setUserId('');
        } else {
          showError(data.message || 'Failed to delete user');
        }
      } catch (error) {
        showError(`Network error: ${error.message}`);
      }
    });
  };

  const handleDeleteTicket = async (e) => {
    e.preventDefault();
    if (!ticketId) {
      showError('Please enter a Ticket ID');
      return;
    }
    showConfirm('Delete Ticket', 'Are you sure you want to delete this ticket?', async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/tickets/${ticketId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.status === 200) {
          showSuccess('Ticket Deleted', 'Ticket deleted successfully');
          setTicketId('');
        } else {
          showError(data.message || 'Failed to delete ticket');
        }
      } catch (error) {
        showError(`Network error: ${error.message}`);
      }
    });
  };

  const handleVipTicketSubmit = async (e) => {
    e.preventDefault();
    if (!movieId || !vipRecipient || !vipPhone) {
      showError('Please fill in all fields');
      return;
    }
    try {
      const fullVipPhone = `${vipCountryCode}${vipPhone.trim()}`;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-vip-ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: parseInt(movieId), recipient: vipRecipient, phone: fullVipPhone, method: vipMethod }),
      });
      const data = await response.json();
      if (response.status === 200) {
        showSuccess('VIP Ticket Sent', `VIP ticket sent via ${vipMethod}:\n${vipRecipient}: ${data.ticket_token}`);
        setVipRecipient('');
        setVipPhone('');
        setVipCountryCode('+234');
      } else if (response.status === 400 && data.message.includes('VIP tickets sold out')) {
        showError('VIP tickets sold out');
      } else {
        showError(data.message || 'Failed to send VIP ticket');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const handleResendTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) {
      showError('Please select a ticket');
      return;
    }
    try {
      const ticket = tickets.find((t) => t.id === parseInt(selectedTicket));
      if (!ticket) {
        showError('Invalid ticket selected');
        return;
      }
      const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const users = await userResponse.json();
      const user = users.find((u) => u.id === ticket.user_id);
      if (!user) {
        showError('User not found for this ticket');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-vip-ticket`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: ticket.movie_id,
          recipient: vipMethod === 'email' ? user.email : user.phone,
          phone: user.phone,
          method: vipMethod,
        }),
      });
      const data = await response.json();
      if (response.status === 200) {
        showSuccess('Ticket Resent', `Ticket ${ticket.token} resent via ${vipMethod} to ${user.email || user.phone}`);
      } else {
        showError(data.message || 'Failed to resend ticket');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const handleEmailReminderSubmit = async (e) => {
    e.preventDefault();
    if (!movieId || !emailReminderRecipients || !reminderMessage) {
      showError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-reminder`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: parseInt(movieId),
          recipients: emailReminderRecipients,
          phones: emailReminderRecipients, // Backend expects same list for simplicity
          method: 'email',
          message: reminderMessage,
        }),
      });
      const data = await response.json();
      if (response.status === 200) {
        showSuccess('Email Reminders Sent', 'Reminder emails sent successfully');
        setEmailReminderRecipients('');
        setReminderMessage('');
      } else if (response.status === 207) {
        showError(`Some reminder emails failed:\n${data.errors.join('\n')}`);
      } else if (response.status === 404) {
        showError('Movie not found for the provided Movie ID');
      } else if (response.status === 400 && data.message.includes('Number of recipients and phone numbers must match')) {
        showError('Number of recipients and phone numbers must match');
      } else {
        showError(data.message || 'Failed to send reminder emails');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const handleWhatsAppReminderSubmit = async (e) => {
    e.preventDefault();
    if (!movieId || !whatsappReminderRecipients || !reminderMessage) {
      showError('Please fill in all fields');
      return;
    }
    try {
      const fullPhones = whatsappReminderRecipients.split(',').map((p) => `${whatsappCountryCode}${p.trim()}`).join(',');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/send-reminder`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: parseInt(movieId),
          recipients: fullPhones,
          phones: fullPhones,
          method: 'whatsapp',
          message: reminderMessage,
        }),
      });
      const data = await response.json();
      if (response.status === 200) {
        showSuccess('WhatsApp Reminders Sent', 'Reminder WhatsApp messages sent successfully');
        setWhatsappReminderRecipients('');
        setReminderMessage('');
        setWhatsappCountryCode('+234');
      } else if (response.status === 207) {
        showError(`Some reminder messages failed:\n${data.errors.join('\n')}`);
      } else if (response.status === 404) {
        showError('Movie not found for the provided Movie ID');
      } else if (response.status === 400 && data.message.includes('Number of recipients and phone numbers must match')) {
        showError('Number of recipients and phone numbers must match');
      } else {
        showError(data.message || 'Failed to send reminder WhatsApp messages');
      }
    } catch (error) {
      showError(`Network error: ${error.message}`);
    }
  };

  const movieOptions = movies.map((movie) => ({
    value: movie.id,
    label: `${movie.title} (ID: ${movie.id})`,
  }));

  const ticketOptions = tickets.map((ticket) => ({
    value: ticket.id,
    label: `Ticket ID: ${ticket.id}, Token: ${ticket.token}, Movie ID: ${ticket.movie_id}, Type: ${ticket.ticket_type}`,
  }));

  const handleMovieSelect = (selectedOption) => {
    setMovieId(selectedOption ? selectedOption.value : '');
  };

  return (
    <div className="container mt-5">
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Resend Existing Ticket</h3>
              <form onSubmit={handleResendTicket}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Ticket</label>
                  <Select
                    options={ticketOptions}
                    value={ticketOptions.find((option) => option.value === selectedTicket) || null}
                    onChange={(option) => setSelectedTicket(option ? option.value : '')}
                    placeholder="Select a ticket..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Method</label>
                  <select
                    value={vipMethod}
                    onChange={(e) => setVipMethod(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Resend Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Send Event Ticket (Email)</h3>
              <form onSubmit={handleEmailSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find((option) => option.value === movieId) || null}
                    onChange={handleMovieSelect}
                    placeholder="Select a movie..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Emails (comma-separated)</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="email1@example.com,email2@example.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phones (comma-separated)</label>
                  <div className="input-group">
                    <Select
                      options={countryCodes}
                      value={countryCodes.find((option) => option.value === countryCode) || null}
                      onChange={(option) => setCountryCode(option ? option.value : '+234')}
                      placeholder="Code"
                      className="w-25"
                      required
                    />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                      placeholder="1234567890,0987654321"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Send Emails
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Send Event Ticket (WhatsApp)</h3>
              <form onSubmit={handleWhatsAppSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find((option) => option.value === movieId) || null}
                    onChange={handleMovieSelect}
                    placeholder="Select a movie..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phones (comma-separated)</label>
                  <div className="input-group">
                    <Select
                      options={countryCodes}
                      value={countryCodes.find((option) => option.value === countryCode) || null}
                      onChange={(option) => setCountryCode(option ? option.value : '+234')}
                      placeholder="Code"
                      className="w-25"
                      required
                    />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control"
                      placeholder="1234567890,0987654321"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Send WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Delete User</h3>
              <form onSubmit={handleDeleteUser}>
                <div className="mb-3">
                  <label className="form-label fw-bold">User ID</label>
                  <input
                    type="number"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="form-control"
                    placeholder="Enter User ID"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100 btn-outline-danger text-white hover-shadow">
                  Delete User
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Delete Ticket</h3>
              <form onSubmit={handleDeleteTicket}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Ticket ID</label>
                  <input
                    type="number"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    className="form-control"
                    placeholder="Enter Ticket ID"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100 btn-outline-danger text-white hover-shadow">
                  Delete Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Send VIP Ticket</h3>
              <form onSubmit={handleVipTicketSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find((option) => option.value === movieId) || null}
                    onChange={handleMovieSelect}
                    placeholder="Select a movie..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Recipient (Email or Phone)</label>
                  <input
                    type="text"
                    value={vipRecipient}
                    onChange={(e) => setVipRecipient(e.target.value)}
                    className="form-control"
                    placeholder="email@example.com or 1234567890"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phone</label>
                  <div className="input-group">
                    <Select
                      options={countryCodes}
                      value={countryCodes.find((option) => option.value === vipCountryCode) || null}
                      onChange={(option) => setVipCountryCode(option ? option.value : '+234')}
                      placeholder="Code"
                      className="w-25"
                      required
                    />
                    <input
                      type="text"
                      value={vipPhone}
                      onChange={(e) => setVipPhone(e.target.value)}
                      className="form-control"
                      placeholder="1234567890"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Method</label>
                  <select
                    value={vipMethod}
                    onChange={(e) => setVipMethod(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Send VIP Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Send Email Reminder</h3>
              <form onSubmit={handleEmailReminderSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find((option) => option.value === movieId) || null}
                    onChange={handleMovieSelect}
                    placeholder="Select a movie..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Emails (comma-separated)</label>
                  <input
                    type="text"
                    value={emailReminderRecipients}
                    onChange={(e) => setEmailReminderRecipients(e.target.value)}
                    className="form-control"
                    placeholder="email1@example.com,email2@example.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Message</label>
                  <textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder="Enter reminder message"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Send Email Reminder
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">Send WhatsApp Reminder</h3>
              <form onSubmit={handleWhatsAppReminderSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Movie</label>
                  <Select
                    options={movieOptions}
                    value={movieOptions.find((option) => option.value === movieId) || null}
                    onChange={handleMovieSelect}
                    placeholder="Select a movie..."
                    isClearable
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phones (comma-separated)</label>
                  <div className="input-group">
                    <Select
                      options={countryCodes}
                      value={countryCodes.find((option) => option.value === whatsappCountryCode) || null}
                      onChange={(option) => setWhatsappCountryCode(option ? option.value : '+234')}
                      placeholder="Code"
                      className="w-25"
                      required
                    />
                    <input
                      type="text"
                      value={whatsappReminderRecipients}
                      onChange={(e) => setWhatsappReminderRecipients(e.target.value)}
                      className="form-control"
                      placeholder="1234567890,0987654321"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Message</label>
                  <textarea
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder="Enter reminder message"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
                  Send WhatsApp Reminder
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;