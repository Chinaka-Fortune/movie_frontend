import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import Select from 'react-select';

const VerifyToken = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [result, setResult] = useState(null);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
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
          const text = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
        }
        const data = await response.json();
        console.log('DEBUG: VerifyToken tickets fetched:', data);
        setTickets(data);
        if (data.length > 0) {
          setSelectedTicket(data[0].id);
        }
      } catch (error) {
        console.error('DEBUG: Fetch tickets error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to fetch tickets: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
      }
    };
    fetchTickets();
  }, [authTokens?.token]);

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0].id);
    }
  }, [tickets, selectedTicket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a ticket',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
      });
      return;
    }
    try {
      const ticket = tickets.find((t) => t.id === parseInt(selectedTicket));
      if (!ticket) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid ticket selected',
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
        return;
      }
      console.log('DEBUG: Verifying ticket token:', ticket.token);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/verify-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: ticket.token }),
      });
      const data = await response.json();
      if (response.status === 200) {
        setResult(data);
      } else {
        const msg = data.message || 'Invalid token';
        setResult({ message: msg });
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
          footer: '<button class="btn btn-sm btn-outline-primary" onclick="this.closest(\'.swal2-container\').querySelector(\'.swal2-confirm\').click(); window.location.reload();">Retry</button>',
        });
      }
    } catch (error) {
      const msg = `Error verifying token: ${error.message}`;
      setResult({ message: msg });
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        footer: '<button class="btn btn-sm btn-outline-primary" onclick="this.closest(\'.swal2-container\').querySelector(\'.swal2-confirm\').click(); window.location.reload();">Retry</button>',
      });
    }
  };

  const ticketOptions = tickets.map((ticket) => ({
    value: ticket.id,
    label: `Ticket ID: ${ticket.id}, Token: ${ticket.token}, Movie ID: ${ticket.movie_id}, Type: ${ticket.ticket_type}`,
  }));

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title h5 mb-4 text-primary">Verify Ticket Token</h3>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary w-100 btn-outline-primary text-white hover-shadow">
            Verify Token
          </button>
        </form>
        {result && (
          <div className="mt-3">
            {result.valid ? (
              <div className="alert alert-success">
                <p>Valid Ticket</p>
                <p>Email: {result.user_email}</p>
                <p>Phone: {result.user_phone}</p>
                <p>Movie: {result.movie_title}</p>
                <p>Premiere Date: {result.premiere_date}</p>
                <p>Created At: {result.created_at}</p>
                <p>Ticket Type: {result.ticket_type}</p>
              </div>
            ) : (
              <p className="alert alert-danger">{result.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyToken;