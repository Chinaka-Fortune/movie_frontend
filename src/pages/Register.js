import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('DEBUG: Submitting register form:', { email, phone, password });
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger'
        }
      });
      return;
    }
    if (!/^\+?\d{10,15}$/.test(phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Phone',
        text: 'Please enter a valid phone number',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger'
        }
      });
      return;
    }
    if (password.length < 8) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 8 characters long',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger'
        }
      });
      return;
    }
    const result = await registerUser(email, phone, password);
    console.log('DEBUG: Register result:', result);
    if (result.success) {
      navigate(result.redirect);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: result.error,
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: {
          popup: 'shadow-lg',
          confirmButton: 'btn btn-danger'
        }
      });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="text-center mb-4 text-primary">Register</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-outline-primary hover-shadow">Register</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;