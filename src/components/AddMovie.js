import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { deleteMovie } from '../utils/api';

const AddMovie = ({ movies = [], setMovies }) => {
  const [title, setTitle] = useState('');
  const [premiereDate, setPremiereDate] = useState('');
  const [flierImage, setFlierImage] = useState(null);
  const [price, setPrice] = useState('');
  const { authTokens } = useContext(AuthContext);

  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#dc3545',
      background: '#fff',
      customClass: {
        popup: 'shadow-lg',
        confirmButton: 'btn btn-danger'
      }
    });
  };

  const showSuccess = (title, message) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#007bff',
      background: '#fff',
      customClass: {
        popup: 'shadow-lg',
        confirmButton: 'btn btn-primary'
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !premiereDate || !flierImage || !price) {
      showError('Please fill in all fields: title, premiere date, flier image, and price');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('premiere_date', premiereDate);
    formData.append('flier_image', flierImage);
    formData.append('price', parseFloat(price).toFixed(2));

    try {
      console.log('DEBUG: Adding movie with URL:', `${process.env.REACT_APP_API_URL}/admin/movies/v1`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/movies/v1`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authTokens?.token}`
        },
        body: formData
      });
      const data = await response.json();
      if (response.status === 201) {
        showSuccess('Movie Added', 'Movie added successfully');
        setTitle('');
        setPremiereDate('');
        setFlierImage(null);
        setPrice('');
        // Fetch updated movies list
        const moviesResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/movies`, {
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        const updatedMovies = await moviesResponse.json();
        setMovies(updatedMovies);
      } else {
        showError(data.message || 'Failed to add movie');
      }
    } catch (error) {
      console.error('DEBUG: Network error:', error);
      showError(`Network error: ${error.message}`);
    }
  };

  const handleDelete = (movieId) => {
    deleteMovie(movieId, authTokens, setMovies, movies);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <h3 className="card-title h5 mb-4 text-primary">Add Movie</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="Enter movie title"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Premiere Date</label>
            <input
              type="date"
              value={premiereDate}
              onChange={(e) => setPremiereDate(e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Price (NGN)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-control"
              placeholder="Enter movie price (e.g., 13000.00)"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Flier Image</label>
            <input
              type="file"
              onChange={(e) => setFlierImage(e.target.files[0])}
              className="form-control"
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-outline-primary hover-shadow">Add Movie</button>
        </form>
        <h3 className="card-title h5 mt-5 mb-4 text-primary">Movies</h3>
        {movies && movies.length === 0 ? (
          <p>No movies available.</p>
        ) : (
          <ul className="list-group">
            {movies && movies.map((movie) => (
              <li key={movie.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{movie.title} ({movie.premiere_date}, NGN {movie.regular_price || movie.price})</span>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="btn btn-danger btn-sm btn-outline-danger hover-shadow"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

AddMovie.propTypes = {
  movies: PropTypes.array,
  setMovies: PropTypes.func.isRequired
};

export default AddMovie;