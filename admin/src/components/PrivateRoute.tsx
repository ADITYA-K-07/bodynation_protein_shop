import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { PropsWithChildren } from 'react';

export default function PrivateRoute({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
