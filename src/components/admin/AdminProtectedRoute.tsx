import { type PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../app/lib/auth';

export default function AdminProtectedRoute({ children }: PropsWithChildren) {
  const role = localStorage.getItem('role');

  if (!isAuthenticated() || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
