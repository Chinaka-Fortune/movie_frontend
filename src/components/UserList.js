import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { deleteUser } from '../utils/api';
import { deleteMovie } from '../utils/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${authTokens?.token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error fetching users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error fetching users: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
      }
    };
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/movies`, {
          headers: { Authorization: `Bearer ${authTokens?.token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Error fetching movies');
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Error fetching movies: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
      }
    };
    if (authTokens) {
      fetchUsers();
      fetchMovies();
    }
  }, [authTokens]);

  const handleDeleteMovie = (movieId) => {
    deleteMovie(movieId, authTokens, setMovies, movies);
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.payments.map((p) => (
                      <div key={p.id}>
                        ID: {p.id}, Movie: {p.movie_id}, Amount: {p.amount}, Status: {p.status}
                      </div>
                    ))}
                  </td>
                  <td>
                    {user.tickets.map((t) => (
                      <div key={t.id}>
                        Token: {t.token}, Movie: {t.movie_id}
                      </div>
                    ))}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteUser(user.id, authTokens)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="card-title h5 mt-4 mb-4">Movies (Admin)</h3>
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {movies.map((movie) => (
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