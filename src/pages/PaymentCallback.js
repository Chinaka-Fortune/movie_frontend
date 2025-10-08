import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';

const PaymentCallback = () => {
  const [status, setStatus] = useState('Verifying payment...');
  const navigate = useNavigate();
  const location = useLocation();
  const { authTokens } = useContext(AuthContext);

  const verifyPayment = async (reference, retryCount = 0, maxRetries = 2) => {
    try {
      console.log('DEBUG: Verifying payment with reference:', reference);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/verify/${reference}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authTokens?.token}`,
        },
      });
      const data = await response.json();
      console.log('DEBUG: Verification response:', data, 'Status:', response.status);
      if (response.status === 200) {
        setStatus(`Payment verified! Ticket token: ${data.ticket_token} (${data.ticket_type})`);
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful',
          text: `Ticket Token: ${data.ticket_token} (${data.ticket_type})`,
          confirmButtonColor: '#28a745',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-success' },
        });
        setTimeout(() => navigate(`/payment-status?reference=${reference}`), 10000);
      } else {
        setStatus(`Payment verification failed: ${data.message || 'Unknown error'}`);
        Swal.fire({
          icon: 'error',
          title: 'Payment Error',
          text: `${data.message || 'Unknown error'} ${data.error ? JSON.stringify(data.error) : ''}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
        setTimeout(() => navigate('/movies'), 10000);
      }
    } catch (error) {
      console.error('DEBUG: Verification error:', error);
      if (retryCount < maxRetries) {
        console.log(`DEBUG: Retrying payment verification, attempt ${retryCount + 1}`);
        setTimeout(() => verifyPayment(reference, retryCount + 1, maxRetries), 2000);
      } else {
        setStatus(`Error verifying payment: ${error.message}`);
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: `Error verifying payment: ${error.message}`,
          confirmButtonColor: '#dc3545',
          background: '#fff',
          customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
        });
        setTimeout(() => navigate('/movies'), 10000);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference') || params.get('trxref');
    if (!reference) {
      setStatus('Error: No payment reference provided');
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: 'No payment reference provided',
        confirmButtonColor: '#dc3545',
        background: '#fff',
        customClass: { popup: 'shadow-lg', confirmButton: 'btn btn-danger' },
      });
      setTimeout(() => navigate('/movies'), 10000);
      return;
    }
    verifyPayment(reference);
  }, [location, navigate, authTokens?.token]);

  return (
    <div className="container my-4 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <h2 className="h2 mb-4">Payment Status</h2>
      <p>{status}</p>
    </div>
  );
};

export default PaymentCallback;