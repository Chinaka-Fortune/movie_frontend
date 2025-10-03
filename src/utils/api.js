import Swal from 'sweetalert2';

export const fetchMovies = async (authTokens) => {
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
    console.log('DEBUG: Movies fetched:', data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('DEBUG: Fetch movies error:', error);
    throw error;
  }
};

export const deleteMovie = async (movieId, authTokens, setMovies, movies) => {
  Swal.fire({
    icon: 'warning',
    title: 'Delete Movie',
    text: 'Are you sure you want to delete this movie? This will also delete associated tickets and payments.',
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
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/movies/${movieId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authTokens?.token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }
        setMovies(movies.filter((movie) => movie.id !== movieId));
        Swal.fire({
          icon: 'success',
          title: 'Movie Deleted',
          text: 'Movie and associated data deleted successfully',
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
          text: `Failed to delete movie: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: {
            popup: 'shadow-lg',
            confirmButton: 'btn btn-danger',
          },
        });
      }
    }
  });
};

export const deleteUser = async (userId, authTokens) => {
  Swal.fire({
    icon: 'warning',
    title: 'Delete User',
    text: 'Are you sure you want to delete this user? This will also delete their payments and tickets.',
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
  }).then(async (result) => {
    if (result.isConfirmed) {
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
          Swal.fire({
            icon: 'success',
            title: 'User Deleted',
            text: 'User deleted successfully',
            confirmButtonColor: '#28a745',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-success',
            },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Failed to delete user',
            confirmButtonColor: '#dc3545',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-danger',
            },
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to delete user: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: {
            popup: 'shadow-lg',
            confirmButton: 'btn btn-danger',
          },
        });
      }
    }
  });
};

export const deleteTicket = async (ticketId, authTokens) => {
  Swal.fire({
    icon: 'warning',
    title: 'Delete Ticket',
    text: 'Are you sure you want to delete this ticket?',
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
  }).then(async (result) => {
    if (result.isConfirmed) {
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
          Swal.fire({
            icon: 'success',
            title: 'Ticket Deleted',
            text: 'Ticket deleted successfully',
            confirmButtonColor: '#28a745',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-success',
            },
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Failed to delete ticket',
            confirmButtonColor: '#dc3545',
            background: '#fff',
            customClass: {
              popup: 'shadow-lg',
              confirmButton: 'btn btn-danger',
            },
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Failed to delete ticket: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: {
            popup: 'shadow-lg',
            confirmButton: 'btn btn-danger',
          },
        });
      }
    }
  });
};