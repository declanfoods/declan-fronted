import { Navigate, type RouteObject } from 'react-router-dom';
import EmailVerification from '../../features/auth/pages/EmailVerification';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import Home from '../../components/pages/user/Home';
import Login from '../../features/auth/pages/Login';
import ResetPassword from '../../features/auth/pages/ResetPassword';
import SignUp from '../../features/auth/pages/SignUp';
import VerifyEmail from '../../features/auth/pages/VerifyEmail';
import GuestOrderTrackingPage from '../../features/orders/pages/GuestOrderTrackingPage';
import MarketingLayout from '../layouts/MarketingLayout';

export const publicRoutes: RouteObject[] = [
  { path: '/signup', element: <SignUp /> },
  { path: '/login', element: <Login /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/verification/:userId', element: <EmailVerification /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password/:userId', element: <ResetPassword /> },
  { path: '/cart', element: <Navigate to="/app/cart" replace /> },
  { path: '/track-order', element: <GuestOrderTrackingPage /> },
  {
    element: <MarketingLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '*', element: <Home /> },
    ],
  },
];
