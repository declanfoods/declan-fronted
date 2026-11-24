import type { RouteObject } from 'react-router-dom';
import DeliveryDetails from '../../features/rider/deliveries/DeliveryDetails';
import DeliverySuccess from '../../features/rider/deliveries/DeliverySuccess';
import DeliveryVerification from '../../features/rider/deliveries/DeliveryVerification';
import RiderChangePassword from '../../features/rider/account/RiderChangePassword';
import RiderDeliveries from '../../features/rider/deliveries/RiderDeliveries';
import RiderHome from '../../features/rider/deliveries/RiderHome';
import RiderLogin from '../../features/rider/account/RiderLogin';
import RiderProfile from '../../features/rider/account/RiderProfile';
import RiderSplash from '../../features/rider/account/RiderSplash';

export const riderRoutes: RouteObject[] = [
  { path: '/rider', element: <RiderSplash /> },
  { path: '/rider/login', element: <RiderLogin /> },
  { path: '/rider/home', element: <RiderHome /> },
  { path: '/rider/profile', element: <RiderProfile /> },
  { path: '/rider/deliveries', element: <RiderDeliveries /> },
  { path: '/rider/change-password', element: <RiderChangePassword /> },
  { path: '/rider/deliveries/:id', element: <DeliveryDetails /> },
  { path: '/rider/deliveries/:id/verify', element: <DeliveryVerification /> },
  { path: '/rider/deliveries/:id/success', element: <DeliverySuccess /> },
];
