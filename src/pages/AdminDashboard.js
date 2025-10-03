import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import AddMovie from '../components/AddMovie';
import SendMessage from '../components/SendMessage';
import UserList from '../components/UserList';
import VerifyToken from '../components/VerifyToken';
import { deleteMovie } from '../utils/api';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [vipPrice, setVipPrice] = useState('25000.00');
  const [vipLimit, setVipLimit] = useState('50');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authTokens, user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const isValidBase64 = (str) => {
    try {
      return str && btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  };

  const handleImageError = (e) => {
    console.error('DEBUG: Image failed to load for movie ID:', e.target.dataset.movieId);
    e.target.src = '/images/no-image.jpg';
    e.target.onerror = null;
  };

  const fetchTickets = useCallback(async (retryCount = 0, maxRetries = 2) => {
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
        const message = errorData.message || `HTTP error! Status: ${response.status}`;
        if (response.status === 401 && retryCount < maxRetries) {
          console.log('DEBUG: 401 Unauthorized, retrying fetchTickets');
          logoutUser();
          navigate('/login');
          return;
        }
        if (response.status === 403) {
          throw new Error('Admin access required');
        }
        throw new Error(message);
      }
      const data = await response.json();
      console.log('DEBUG: AdminDashboard tickets fetched:', data);
      if (!Array.isArray(data)) {
        console.warn('DEBUG: Tickets data is not an array:', data);
        setError('Received invalid ticket data format');
        setTickets([]);
      } else {
        setTickets(data);
        setError(null);
      }
    } catch (error) {
      console.error('DEBUG: Network error (tickets):', error);
      setError(`Failed to fetch tickets: ${error.message}`);
      if (retryCount < maxRetries) {
        console.log(`DEBUG: Retrying fetchTickets, attempt ${retryCount + 1}`);
        setTimeout(() => fetchTickets(retryCount + 1, maxRetries), 1000);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to fetch tickets: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: {
            popup: 'shadow-lg',
            confirmButton: 'btn btn-danger',
          },
        });
      }
    }
  }, [authTokens?.token, logoutUser, navigate]);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const fetchMovies = async () => {
      try {
        console.log('DEBUG: Fetching movies from:', `${process.env.REACT_APP_API_URL}/admin/movies`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/movies`, {
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
        console.log('DEBUG: AdminDashboard movies fetched:', data);
        if (isMounted) {
          setMovies(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('DEBUG: Network error (movies):', error);
        if (isMounted) {
          Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: `Failed to fetch movies: ${error.message}`,
            confirmButtonColor: '#dc3545',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-danger',
            },
          });
        }
      }
    };

    const fetchSettings = async () => {
      try {
        console.log('DEBUG: Fetching settings from:', `${process.env.REACT_APP_API_URL}/settings`);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/settings`, {
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
        if (isMounted) {
          setVipPrice(data.vip_price || '25000.00');
          setVipLimit(data.vip_limit || '50');
        }
      } catch (error) {
        console.error('DEBUG: Network error (settings):', error);
        if (isMounted) {
          Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: `Failed to fetch settings: ${error.message}`,
            confirmButtonColor: '#dc3545',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-danger',
            },
          });
        }
      }
    };

    Promise.all([fetchMovies(), fetchTickets(), fetchSettings()]).then(() => {
      if (isMounted) setLoading(false);
    }).catch((error) => {
      console.error('DEBUG: Promise.all error:', error);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [authTokens?.token, user?.is_admin, navigate, logoutUser, fetchTickets]);

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/settings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vip_price: vipPrice, vip_limit: vipLimit }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! Status: ${response.status}`);
      }
      Swal.fire({
        icon: 'success',
        title: 'Settings Updated',
        text: 'VIP settings have been updated',
        confirmButtonColor: '#28a745',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-success',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to update settings: ${error.message}`,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger',
        },
      });
    }
  };

  const handleDeleteMovie = (movieId) => {
    deleteMovie(movieId, authTokens, setMovies, movies);
  };

  const handleLogout = () => {
    const result = logoutUser();
    navigate(result.redirect);
  };

  if (!user?.is_admin) {
    return (
      <div className="container my-4">
        <p className="text-danger">Admin access required</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container my-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand">Admin Dashboard</span>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link active" href="/movies">Movies</a>
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link btn btn-outline-danger text-white"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="row g-4">
        <div className="col-12">
          <h3 className="h5 mb-4 text-primary">Movies List</h3>
          {movies.length === 0 ? (
            <p>No movies available.</p>
          ) : (
            <div className="row g-4">
              {movies.map((movie) => (
                <div key={movie.id} className="col-md-4">
                  <div className="card shadow-sm border-0">
                    <img
                      src={
                        movie.flier_image && isValidBase64(movie.flier_image)
                          ? `data:image/jpeg;base64,${movie.flier_image}`
                          : '/images/no-image.jpg'
                      }
                      className="card-img-top"
                      alt={movie.title || 'Movie'}
                      data-movie-id={movie.id}
                      onError={handleImageError}
                    />
                    <div className="card-body">
                      <h5 className="card-title">ID: {movie.id} - {movie.title || 'Untitled'}</h5>
                      <p className="card-text">Premiere: {movie.premiere_date || 'N/A'}</p>
                      <p className="card-text">Regular: NGN {movie.regular_price || '0.00'}</p>
                      <p className="card-text">VIP: NGN {movie.vip_price || '0.00'}</p>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="btn btn-danger btn-sm mt-2"
                      >
                        Delete Movie
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-12">
          <h3 className="h5 mb-4 text-primary">Tickets List</h3>
          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchTickets();
                }}
              >
                Retry
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <p>No tickets available.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>User ID</th>
                    <th>Movie ID</th>
                    <th>Payment ID</th>
                    <th>Ticket Token</th>
                    <th>Ticket Type</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.id || 'N/A'}</td>
                      <td>{ticket.user_id || 'N/A'}</td>
                      <td>{ticket.movie_id || 'N/A'}</td>
                      <td>{ticket.payment_id || 'N/A'}</td>
                      <td>{ticket.token || 'N/A'}</td>
                      <td>{ticket.ticket_type || 'N/A'}</td>
                      <td>{ticket.created_at || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h3 className="card-title h5 mb-4 text-primary">VIP Settings</h3>
              <form onSubmit={handleSettingsUpdate}>
                <div className="mb-3">
                  <label className="form-label fw-bold">VIP Price (NGN)</label>
                  <input
                    type="number"
                    value={vipPrice}
                    onChange={(e) => setVipPrice(e.target.value)}
                    className="form-control"
                    placeholder="Enter VIP price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">VIP Limit</label>
                  <input
                    type="number"
                    value={vipLimit}
                    onChange={(e) => setVipLimit(e.target.value)}
                    className="form-control"
                    placeholder="Enter VIP limit"
                    min="0"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary">
                  Update VIP Settings
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-12">
          <AddMovie movies={movies} setMovies={setMovies} />
        </div>
        <div className="col-12">
          <SendMessage />
        </div>
        <div className="col-12">
          <UserList />
        </div>
        <div className="col-12">
          <VerifyToken />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;