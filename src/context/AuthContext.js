import React, { createContext, useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens') ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).token) : null
  );
  const [loading, setLoading] = useState(true);

  const logoutUser = () => {
    localStorage.removeItem('authTokens');
    setAuthTokens(null);
    setUser(null);
    return { redirect: '/login' };
  };

  const loginUser = async (email, password) => {
    try {
      console.log('DEBUG: Logging in with URL:', `${process.env.REACT_APP_API_URL}/login`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.status === 200) {
        localStorage.setItem('authTokens', JSON.stringify(data));
        setAuthTokens(data);
        const decoded = jwtDecode(data.token);
        setUser(decoded);
        return { success: true, redirect: decoded.is_admin ? '/admin' : '/' };
      } else {
        return { success: false, error: data.message || 'Invalid credentials' };
      }
    } catch (e) {
      return { success: false, error: 'Error logging in: ' + e.message };
    }
  };

  const registerUser = async (email, phone, password) => {
    try {
      console.log('DEBUG: Registering with URL:', `${process.env.REACT_APP_API_URL}/register`);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, password })
      });
      if (response.status === 201) {
        return await loginUser(email, password);
      } else {
        const data = await response.json();
        return { success: false, error: data.message || 'Error creating user' };
      }
    } catch (e) {
      return { success: false, error: 'Error registering user: ' + e.message };
    }
  };

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (authTokens && isMounted) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-token`, {
            headers: { Authorization: `Bearer ${authTokens.token}` },
          });
          if (response.ok) {
            const decoded = jwtDecode(authTokens.token);
            setUser(decoded);
          } else {
            logoutUser();
          }
        } catch (e) {
          console.error('DEBUG: Invalid token:', e);
          logoutUser();
        }
      }
      if (isMounted) setLoading(false);
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [authTokens?.token]);

  const contextData = useMemo(
    () => ({
      user,
      loginUser,
      registerUser,
      logoutUser,
      authTokens,
    }),
    [user, authTokens]
  );

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};