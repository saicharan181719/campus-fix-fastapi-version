import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES = {
  student: '/student',
  faculty: '/faculty',
  maintenance: '/maintenance',
  administrator: '/admin',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = ROLE_ROUTES[user.role] || '/login';
    return <Navigate to={home} replace />;
  }

  return children;
}
