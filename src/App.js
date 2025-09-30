import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Movies from './pages/Movies';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PaymentCallback from './pages/PaymentCallback';

const App = () => {
  const { user, authTokens } = useContext(AuthContext);
  console.log('DEBUG: App.js user:', user);

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">Ohams Movie Ticketing</Link>
          <div className="navbar-nav ms-auto">
            {user ? (
              <>
                <span className="nav-link">Welcome, {user.email}</span>
                {user.is_admin && (
                  <Link className="nav-link" to="/admin">Admin Dashboard</Link>
                )}
                <Link className="nav-link" to="/movies">Movies</Link>
              </>
            ) : (
              <>
                <Link className="nav-link" to="/login">Login</Link>
                <Link className="nav-link" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route
          path="/"
          element={user ? <Movies /> : <Navigate to="/login" />}
        />
        <Route
          path="/movies"
          element={user ? <Movies /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && user.is_admin ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route
          path="/payment-callback"
          element={<PaymentCallback />}
        />
      </Routes>
    </div>
  );
};

export default App;