import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${authTokens?.token}` }
        });
        setUsers(response.data);
      } catch (error) {
        alert('Error fetching users: ' + (error.response?.data?.message || error.message));
      }
    };
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies', {
          headers: { Authorization: `Bearer ${authTokens?.token}` }
        });
        setMovies(response.data);
      } catch (error) {
        alert('Error fetching movies: ' + (error.response?.data?.message || error.message));
      }
    };
    if (authTokens) {
      fetchUsers();
      fetchMovies();
    }
  }, [authTokens]);

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/movies/${movieId}`, {
        headers: { Authorization: `Bearer ${authTokens?.token}` }
      });
      setMovies(movies.filter(m => m.id !== movieId));
      alert('Movie deleted');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting movie');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title h5 mb-4">Users</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Payments</th>
                <th>Tickets</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.payments.map(p => (
                      <div key={p.id}>
                        ID: {p.id}, Movie: {p.movie_id}, Amount: {p.amount}, Status: {p.status}
                      </div>
                    ))}
                  </td>
                  <td>
                    {user.tickets.map(t => (
                      <div key={t.id}>
                        Token: {t.token}, Movie: {t.movie_id}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="card-title h5 mt-4 mb-4">Movies (Admin)</h3>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {movies.map(movie => (
            <div key={movie.id} className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">{movie.title}</h4>
                  <p className="card-text text-muted">Premiere: {movie.premiere_date}</p>
                  {movie.flier_image && (
                    <img
                      src={`data:image/jpeg;base64,${movie.flier_image}`}
                      alt={movie.title}
                      className="card-img-top mb-2"
                      style={{ maxHeight: '150px', objectFit: 'cover' }}
                    />
                  )}
                  <button
                    onClick={() => handleDeleteMovie(movie.id)}
                    className="btn btn-danger w-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;