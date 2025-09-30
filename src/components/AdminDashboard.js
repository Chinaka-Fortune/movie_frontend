// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import AddMovie from './AddMovie';
// import SendMessage from './SendMessage';
// import UserList from './UserList';

// const AdminDashboard = () => {
//   const [movies, setMovies] = useState([]);
//   const { authTokens } = useContext(AuthContext);

//   useEffect(() => {
//     const fetchMovies = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/movies', {
//           headers: {
//             Authorization: `Bearer ${authTokens?.token}`,
//             'Content-Type': 'application/json'
//           }
//         });
//         const data = await response.json();
//         if (response.status === 200) {
//           setMovies(data);
//         } else {
//           console.error('Failed to fetch movies:', data.message);
//           window.Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: data.message || 'Failed to fetch movies',
//             confirmButtonColor: '#dc3545'
//           });
//         }
//       } catch (error) {
//         console.error('Network error:', error.message);
//         window.Swal.fire({
//           icon: 'error',
//           title: 'Network Error',
//           text: error.message,
//           confirmButtonColor: '#dc3545'
//         });
//       }
//     };
//     fetchMovies();
//   }, [authTokens]);

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4 text-primary">Admin Dashboard</h2>
//       <div className="row g-4">
//         <div className="col-12">
//           <AddMovie movies={movies} setMovies={setMovies} />
//         </div>
//         <div className="col-12">
//           <SendMessage />
//         </div>
//         <div className="col-12">
//           <UserList />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;