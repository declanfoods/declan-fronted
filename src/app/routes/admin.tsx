import type { RouteObject } from 'react-router-dom';
import AdminDrawer from '../layouts/admin/AdminDrawer';
import AdminDashboard from '../../features/admin/dashboard/pages/AdminDashboard';
import AdminLogin from '../../features/auth/pages/AdminLogin';
import OrderAnalytics from '../../features/admin/orders/pages/OrderAnalytics';
import AdminGeneralDiscounts from '../../features/admin/inventory/discounts/AdminGeneralDiscount';
import CreateFoodPack from '../../features/admin/inventory/foodpacks/CreateFoodPack';
import EditFoodPack from '../../features/admin/inventory/foodpacks/EditFoodPack';
import FoodPackDetails from '../../features/admin/inventory/foodpacks/FoodPackDetails';
import FoodPacksList from '../../features/admin/inventory/foodpacks/FoodPacksList';
import AssignRider from '../../features/admin/orders/pages/AssignRider';
import CreateManualOrder from '../../features/admin/orders/pages/CreateManualOrder';
import OrderDetails from '../../features/admin/orders/pages/OrderDetails';
import OrdersList from '../../features/admin/orders/pages/OrdersList';
import UpdateStatus from '../../features/admin/orders/pages/UpdateStatus';
import AdminPaymentMethods from '../../features/admin/payments/pages/PaymentMethods';
import AdminAddProduct from '../../features/admin/inventory/products/AddProduct';
import AdminEditProduct from '../../features/admin/inventory/products/EditProduct';
import AdminProductDetails from '../../features/admin/inventory/products/ProductDetails';
import AdminProductList from '../../features/admin/inventory/products/ProductList';
import ProductStockHistory from '../../features/admin/inventory/products/ProductStockHistory';
import CommissionCashbackSettings from '../../features/admin/referrals/pages/CommissionCashbackSettings';
import PayoutQueue from '../../features/admin/referrals/pages/PayoutQueue';
import PayoutRequestDetails from '../../features/admin/referrals/pages/PayoutRequestDetails';
import ReferralAnalytics from '../../features/admin/referrals/pages/ReferralAnalytics';
import ReferralDashboard from '../../features/admin/referrals/pages/ReferralDashboard';
import ReferralMemberDetail from '../../features/admin/referrals/pages/ReferralMemberDetail';
import ReferralMembers from '../../features/admin/referrals/pages/ReferralMembers';
import ReferralSettings from '../../features/admin/referrals/pages/ReferralSettings';
import WithdrawalSettings from '../../features/admin/referrals/pages/WithdrawalSettings';
import RiderHub from '../../features/admin/riders/pages/RiderHub';
import RiderOnboarding from '../../features/admin/riders/pages/RiderOnboarding';
import RidersOverview from '../../features/admin/riders/pages/RidersOverview';
import AdminStockHistory from '../../features/admin/inventory/stocks/StockHistory';
import UserActions from '../../features/admin/users/pages/UserActions';
import UserAnalytics from '../../features/admin/users/pages/UserAnalytics';
import UserFinancials from '../../features/admin/users/pages/UserFinancials';
import UserProfile from '../../features/admin/users/pages/UserProfile';
import UsersOverview from '../../features/admin/users/pages/UsersOverview';
import AdminCategoriesOverview from '../../features/admin/categories/CategoriesOverview';
import AdminProtectedRoute from '../layouts/admin/AdminProtectedRoute';

export const adminRoutes: RouteObject[] = [
  { path: '/admin/login', element: <AdminLogin /> },
  {
    element: <AdminProtectedRoute />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/more', element: <AdminDrawer fullPage /> },
      { path: '/admin/orders', element: <OrdersList /> },
      { path: '/admin/orders/manual', element: <CreateManualOrder /> },
      { path: '/admin/orders/:id', element: <OrderDetails /> },
      { path: '/admin/orders/:id/assign-rider', element: <AssignRider /> },
      { path: '/admin/orders/:id/update-status', element: <UpdateStatus /> },
      { path: '/admin/analytics', element: <OrderAnalytics /> },
      { path: '/admin/food-packs', element: <FoodPacksList /> },
      { path: '/admin/food-packs/create', element: <CreateFoodPack /> },
      { path: '/admin/food-packs/:id', element: <FoodPackDetails /> },
      { path: '/admin/food-packs/:id/edit', element: <EditFoodPack /> },
      { path: '/admin/products', element: <AdminProductList /> },
      { path: '/admin/products/add', element: <AdminAddProduct /> },
      { path: '/admin/products/:id', element: <AdminProductDetails /> },
      { path: '/admin/products/:id/edit', element: <AdminEditProduct /> },
      { path: '/admin/products/:id/stock-history', element: <ProductStockHistory /> },
      { path: '/admin/categories', element: <AdminCategoriesOverview /> },
      { path: '/admin/payments', element: <AdminPaymentMethods /> },
      { path: '/admin/stocks', element: <AdminStockHistory /> },
      { path: '/admin/discounts', element: <AdminGeneralDiscounts /> },
      { path: '/admin/riders', element: <RidersOverview /> },
      { path: '/admin/riders/onboard', element: <RiderOnboarding /> },
      { path: '/admin/riders/:id', element: <RiderHub /> },
      { path: '/admin/users', element: <UsersOverview /> },
      { path: '/admin/users/analytics', element: <UserAnalytics /> },
      { path: '/admin/users/:id', element: <UserProfile /> },
      { path: '/admin/users/:id/actions', element: <UserActions /> },
      { path: '/admin/users/:id/financials', element: <UserFinancials /> },
      { path: '/admin/referrals', element: <ReferralDashboard /> },
      { path: '/admin/referrals/queue', element: <PayoutQueue /> },
      { path: '/admin/referrals/queue/:id', element: <PayoutRequestDetails /> },
      { path: '/admin/referrals/members', element: <ReferralMembers /> },
      { path: '/admin/referrals/members/:id', element: <ReferralMemberDetail /> },
      { path: '/admin/referrals/insights', element: <ReferralAnalytics /> },
      { path: '/admin/referrals/settings', element: <ReferralSettings /> },
      { path: '/admin/referrals/settings/commission', element: <CommissionCashbackSettings /> },
      { path: '/admin/referrals/settings/withdrawal', element: <WithdrawalSettings /> },
    ],
  },
];
