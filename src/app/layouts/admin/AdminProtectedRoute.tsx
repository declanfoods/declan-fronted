import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '../../../features/auth/session';

export default function AdminProtectedRoute() {
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
