import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    checkAuth();
  }, []);

  
  const formatUserData = (userData) => {
    if (!userData) {
      console.warn('No user data provided to formatUserData');
      return null;
    }
    
    // Extract nested user data if present
    const userInfo = userData.user || userData;
    
    const formattedData = {
      id: userInfo.id || userInfo._id,
      email: userInfo.email,
      displayName: userInfo.displayName,
      role:userInfo.role
    };
    
    console.log('Formatted user data:', formattedData);
    return formattedData;
  };
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await axios.get('http://localhost:5000/api/auth/me');
        console.log('Auth check response:', response.data); // Debug log
        const formattedUser = formatUserData(response.data);
        if (formattedUser) {
          setUser(formattedUser);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(formatUserData(userData));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  const register = async (email, password, displayName) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        displayName,
        role
      });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(formatUserData(userData));
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};