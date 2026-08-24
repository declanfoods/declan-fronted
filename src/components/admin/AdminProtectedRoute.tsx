import { type PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
export default function AdminProtectedRoute({ children }: PropsWithChildren) {
  const role = localStorage.getItem('role');
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
