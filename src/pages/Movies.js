import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import Select from 'react-select';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [movieId, setMovieId] = useState('');
  const [ticketType, setTicketType] = useState('regular');
  const [loading, setLoading] = useState(true);
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
    console.log('DEBUG: Image failed to load, switching to placeholder');
    e.target.src = '/images/no-image.jpg';
    e.target.onerror = null;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;

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
          const text = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
        }
        const data = await response.json();
        console.log('DEBUG: Movies fetched:', data);
        if (isMounted) {
          setMovies(data);
          if (data.length > 0) {
            setMovieId(data[0].id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('DEBUG: Network error:', error);
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
          setLoading(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, [authTokens?.token, user?.id, navigate]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!movieId || !user?.email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a movie and ensure you are logged in',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger',
        },
      });
      return;
    }
    console.log('DEBUG: Purchase payload:', { movie_id: parseInt(movieId), ticket_type: ticketType, email: user.email });
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ movie_id: parseInt(movieId), ticket_type: ticketType, email: user.email }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${text}`);
      }
      const data = await response.json();
      console.log('DEBUG: Payment initialize response:', data);
      window.location.href = data.authorization_url;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: `Failed to initialize payment: ${error.message}`,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger',
        },
      });
    }
  };

  const handleLogout = () => {
    const result = logoutUser();
    navigate(result.redirect);
  };

  const movieOptions = movies.map(movie => ({
    value: movie.id,
    label: `${movie.title} (Regular: NGN ${movie.regular_price}, VIP: NGN ${movie.vip_price})`,
  }));

  const handleMovieSelect = (selectedOption) => {
    console.log('DEBUG: Selected movieId:', selectedOption ? selectedOption.value : '');
    setMovieId(selectedOption ? selectedOption.value : '');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-center text-primary">Movies</h2>
        <button onClick={handleLogout} className="btn btn-danger btn-outline-danger">
          Logout
        </button>
      </div>
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
                  alt={movie.title}
                  onError={handleImageError}
                />
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text">Premiere: {movie.premiere_date}</p>
                  <p className="card-text">Regular: NGN {movie.regular_price}</p>
                  <p className="card-text">VIP: NGN {movie.vip_price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h3 className="card-title h5 mb-4 text-primary">Buy Ticket</h3>
          <form onSubmit={handlePurchase}>
            <div className="mb-3">
              <label className="form-label fw-bold">Movie</label>
              <Select
                options={movieOptions}
                value={movieOptions.find(option => option.value === movieId) || null}
                onChange={handleMovieSelect}
                placeholder="Search for a movie..."
                isClearable
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Ticket Type</label>
              <div>
                <input
                  type="radio"
                  id="regular"
                  name="ticket_type"
                  value="regular"
                  checked={ticketType === 'regular'}
                  onChange={() => setTicketType('regular')}
                  className="me-2"
                />
                <label htmlFor="regular" className="me-3">Regular</label>
                <input
                  type="radio"
                  id="vip"
                  name="ticket_type"
                  value="vip"
                  checked={ticketType === 'vip'}
                  onChange={() => setTicketType('vip')}
                  className="me-2"
                />
                <label htmlFor="vip">VIP</label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 btn-outline-primary">
              Buy Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Movies;