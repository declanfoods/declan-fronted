import type { RouteObject } from 'react-router-dom';
import DashboardHome from '../../features/account/pages/DashboardHome';
import HomeReferralOverview from '../../features/referrals/pages/HomeReferralOverview';
import ProfilePage from '../../features/account/pages/ProfilePage';
import ReferralEarnings from '../../features/referrals/pages/Earnings';
import ReferralNetwork from '../../features/referrals/pages/Network';
import ReferralOverview from '../../features/referrals/pages/Overview';
import ReferralList from '../../features/referrals/pages/ReferralList';
import RewardsGuide from '../../features/referrals/pages/RewardsGuide';
import Withdraw from '../../features/referrals/pages/Withdraw';
import SavedProducts from '../../components/ui/SavedProducts';
import FoodPackDetailsPage from '../../features/catalogue/pages/FoodPackDetailsPage';
import ProductDetailsPage from '../../features/catalogue/pages/ProductDetailsPage';
import ShopPage from '../../features/catalogue/pages/ShopPage';
import CartPage from '../../features/cart/pages/CartPage';
import ReorderCartPage from '../../features/cart/pages/ReorderCartPage';
import CheckoutPage from '../../features/checkout/pages/CheckoutPage';
import OrderDetailsPage from '../../features/orders/pages/OrderDetailsPage';
import OrdersPage from '../../features/orders/pages/OrdersPage';
import OrderTrackingPage from '../../features/orders/pages/OrderTrackingPage';

export const customerRoutes: RouteObject[] = [
  { path: '/app', element: <DashboardHome /> },
  { path: '/app/shop', element: <ShopPage /> },
  { path: '/app/shop/:id', element: <ProductDetailsPage /> },
  { path: '/app/shop/foodpacks/:foodpackId', element: <FoodPackDetailsPage /> },
  { path: '/app/cart', element: <CartPage /> },
  { path: '/app/checkout', element: <CheckoutPage /> },
  { path: '/app/reorder-cart', element: <ReorderCartPage /> },
  { path: '/app/profile', element: <ProfilePage /> },
  { path: '/app/saved', element: <SavedProducts /> },
  { path: '/app/orders', element: <OrdersPage /> },
  { path: '/app/orders/:orderId', element: <OrderDetailsPage /> },
  { path: '/app/orders/:orderId/tracking', element: <OrderTrackingPage /> },
  { path: '/app/referrals/overview', element: <HomeReferralOverview /> },
  { path: '/app/referrals', element: <ReferralOverview /> },
  { path: '/app/referrals/list', element: <ReferralList /> },
  { path: '/app/referrals/network', element: <ReferralNetwork /> },
  { path: '/app/referrals/earnings', element: <ReferralEarnings /> },
  { path: '/app/referrals/rewards-guide', element: <RewardsGuide /> },
  { path: '/app/referrals/withdraw', element: <Withdraw /> },
];
