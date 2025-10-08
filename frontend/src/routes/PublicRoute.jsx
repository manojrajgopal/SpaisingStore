import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PublicRoute;