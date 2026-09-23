import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/user/Home';
import SignUp from './components/pages/user/SignUp';
import Login from './components/pages/user/Login';
import Cart from './components/pages/user/Cart';
import Checkout from './components/pages/app/Checkout';
import ReorderCart from './components/pages/app/ReorderCart';
import DashboardHome from './components/pages/app/DashboardHome';
import Shop from './components/pages/app/Shop';
import AppCart from './components/pages/app/Cart';
import Profile from './components/pages/app/Profile';
import Orders from './components/pages/app/Orders';
import ProductDetails from "./components/ui/ProductDetails"
import RiderSplash from './components/pages/rider/RiderSplash';
import RiderLogin from './components/pages/rider/RiderLogin';
import RiderHome from './components/pages/rider/RiderHome';
import RiderProfile from './components/pages/rider/RiderProfile';
import RiderChangePassword from './components/pages/rider/RiderChangePassword';
import RiderDeliveries from './components/pages/rider/RiderDeliveries';
import VerifyEmail from './components/pages/user/VerifyEmail';
import ForgotPassword from './components/pages/user/ForgotPassword';
import ResetPassword from './components/pages/user/ResetPassword';
import EmailVerification from "./components/pages/user/EmailVerification"
import OrderDetail from './components/ui/OrderDetail';
import SavedProducts from './components/ui/SavedProducts';
import OrderTracking from './components/ui/OrderTracking';
import ReferralOverview from './components/pages/app/referral/Overview';
import ReferralList from './components/pages/app/referral/ReferralList';
import ReferralNetwork from './components/pages/app/referral/Network';
import ReferralEarnings from './components/pages/app/referral/Earnings';
import RewardsGuide from './components/pages/app/referral/RewardsGuide';
import Withdraw from './components/pages/app/referral/Withdraw';

// admin pages
import AdminLogin from './components/pages/admin/AdminLogin';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminDrawer from './components/admin/AdminDrawer';
import OrdersList from './components/pages/admin/orders/OrdersList';
import OrderDetails from './components/pages/admin/orders/OrderDetails';
import AssignRider from './components/pages/admin/orders/AssignRider';
import UpdateStatus from './components/pages/admin/orders/UpdateStatus';
import OrderAnalytics from './components/pages/admin/analytics/OrderAnalytics';
import FoodPacksList from './components/pages/admin/foodpacks/FoodPacksList';
import FoodPackDetails from './components/pages/admin/foodpacks/FoodPackDetails';
import CreateFoodPack from './components/pages/admin/foodpacks/CreateFoodPack';
import EditFoodPack from './components/pages/admin/foodpacks/EditFoodPack';
import AdminProductList from './components/pages/admin/products/ProductList';
import AdminCategoriesOverview from './components/pages/admin/categories/CategoriesOverview';
import AdminPaymentMethods from './components/pages/admin/payments/PaymentMethods';
import AdminStockHistory from './components/pages/admin/stocks/StockHistory';
import AdminProductDetails from './components/pages/admin/products/ProductDetails';
import AdminAddProduct from './components/pages/admin/products/AddProduct';
import AdminEditProduct from './components/pages/admin/products/EditProduct';
import RidersOverview from './components/pages/admin/riders/RidersOverview';
import RiderHub from './components/pages/admin/riders/RiderHub';
import RiderOnboarding from './components/pages/admin/riders/RiderOnboarding';
import GuestOrderTracking from './components/pages/app/GuestOrderTracking';
import DeliveryDetails from './components/pages/rider/DeliveryDetails';
import DeliveryVerification from './components/pages/rider/DeliveryVerification';
import DeliverySuccess from './components/pages/rider/DeliverySuccess';

// admin users
import UsersOverview from './components/pages/admin/users/UsersOverview';
import UserProfile from './components/pages/admin/users/UserProfile';
import UserActions from './components/pages/admin/users/UserActions';
import UserFinancials from './components/pages/admin/users/UserFinancials';
import UserAnalytics from './components/pages/admin/users/UserAnalytics';

// admin referral

import ReferralDashboard from './components/pages/admin/referral/ReferralDashboard';
import PayoutQueue from './components/pages/admin/referral/PayoutQueue';
import PayoutRequestDetails from './components/pages/admin/referral/PayoutRequestDetails';
import ReferralMembers from './components/pages/admin/referral/ReferralMembers';
import ReferralMemberDetail from './components/pages/admin/referral/ReferralMemberDetail';
import ReferralAnalytics from './components/pages/admin/referral/ReferralAnalytics';
import ReferralSettings from './components/pages/admin/referral/ReferralSettings';
import CommissionCashbackSettings from './components/pages/admin/referral/CommissionCashbackSettings';
import WithdrawalSettings from './components/pages/admin/referral/WithdrawalSettings';
import HomeReferralOverview from './components/pages/app/referral/HomeReferralOverview';





export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white text-ink">
        <Routes>
          {/* Auth pages — standalone layout */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verification/:userId" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:userId" element={<ResetPassword />} />
          {/* Marketing cart + checkout — their own top bar */}
          <Route path="/cart" element={<Cart />} />

          {/* Logged-in app — shared top bar + bottom nav */}
          <Route path="/app" element={<DashboardHome />} />
          <Route path="/app/orders" element={<Orders />} />
          <Route path="/app/referrals/overview" element={<HomeReferralOverview />}/>
          <Route path="/app/shop" element={<Shop />} />
          <Route path="/app/shop/:id" element={<ProductDetails />} />
          <Route path="/app/cart" element={<AppCart />} />
          <Route path="/app/profile" element={<Profile />} />
          {/* FIX: this path had a leading space — " /app/orders/:orderId" —
              which React Router treats as a literal character, so the route
              NEVER matched and order detail pages 404'd into the catch-all
              Home route. */}
          <Route path="/app/orders/:orderId" element={<OrderDetail />} />
          <Route path="/app/saved" element={<SavedProducts />} />
          <Route path="/app/checkout" element={<Checkout />} />
          {/* The reorder cart is a SEPARATE cart from /app/cart — see the
              header comment in ReorderCart.tsx. */}
          <Route path="/app/reorder-cart" element={<ReorderCart />} />
          <Route path="/app/orders/:orderId/tracking" element={<OrderTracking />} />
          <Route path="/track-order" element={<GuestOrderTracking />} />
          {/* referral: */}
          <Route path="/app/referrals" element={<ReferralOverview />} />
          <Route path="/app/referrals/list" element={<ReferralList />} />
          <Route path="/app/referrals/network" element={<ReferralNetwork />} />
          <Route path="/app/referrals/earnings" element={<ReferralEarnings />} />
          <Route path="/app/referrals/rewards-guide" element={<RewardsGuide />} />
          <Route path="/app/referrals/withdraw" element={<Withdraw />} />
          {/* admin pages */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/more"
            element={
              <AdminProtectedRoute>
                <AdminDrawer fullPage />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <OrdersList />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <AdminProtectedRoute>
                <OrderDetails />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id/assign-rider"
            element={
              <AdminProtectedRoute>
                <AssignRider />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/orders/:id/update-status"
            element={
              <AdminProtectedRoute>
                <UpdateStatus />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminProtectedRoute>
                <OrderAnalytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/food-packs"
            element={
              <AdminProtectedRoute>
                <FoodPacksList />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/food-packs/create"
            element={
              <AdminProtectedRoute>
                <CreateFoodPack />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/food-packs/:id"
            element={
              <AdminProtectedRoute>
                <FoodPackDetails />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/food-packs/:id/edit"
            element={
              <AdminProtectedRoute>
                <EditFoodPack />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <AdminProductList />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminProtectedRoute>
                <AdminCategoriesOverview />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminProtectedRoute>
                <AdminPaymentMethods />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/stocks"
            element={
              <AdminProtectedRoute>
                <AdminStockHistory />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products/add"
            element={
              <AdminProtectedRoute>
                <AdminAddProduct />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <AdminProtectedRoute>
                <AdminProductDetails />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/products/:id/edit"
            element={
              <AdminProtectedRoute>
                <AdminEditProduct />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/riders"
            element={
              <AdminProtectedRoute>
                <RidersOverview />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/riders/onboard"
            element={
              <AdminProtectedRoute>
                <RiderOnboarding />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/riders/:id"
            element={
              <AdminProtectedRoute>
                <RiderHub />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <UsersOverview />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/analytics"
            element={
              <AdminProtectedRoute>
                <UserAnalytics />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <AdminProtectedRoute>
                <UserProfile />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/actions"
            element={
              <AdminProtectedRoute>
                <UserActions />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id/financials"
            element={
              <AdminProtectedRoute>
                <UserFinancials />
              </AdminProtectedRoute>
            }
          />

          <Route path="/admin/referrals" element={<AdminProtectedRoute><ReferralDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/queue" element={<AdminProtectedRoute><PayoutQueue /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/queue/:id" element={<AdminProtectedRoute><PayoutRequestDetails /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/members" element={<AdminProtectedRoute><ReferralMembers /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/members/:id" element={<AdminProtectedRoute><ReferralMemberDetail /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/insights" element={<AdminProtectedRoute><ReferralAnalytics /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/settings" element={<AdminProtectedRoute><ReferralSettings /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/settings/commission" element={<AdminProtectedRoute><CommissionCashbackSettings /></AdminProtectedRoute>} />
          <Route path="/admin/referrals/settings/withdrawal" element={<AdminProtectedRoute><WithdrawalSettings /></AdminProtectedRoute>} />

          {/* rider pages */}
          <Route path="/rider" element={<RiderSplash />} />
          <Route path="/rider/login" element={<RiderLogin />} />
          <Route path="/rider/home" element={<RiderHome />} />
          <Route path="/rider/profile" element={<RiderProfile />} />
          <Route path="/rider/deliveries" element={<RiderDeliveries />} />
          <Route path="/rider/change-password" element={<RiderChangePassword />} />
          <Route path="/rider/deliveries/:id" element={<DeliveryDetails />} />
          <Route path="/rider/deliveries/:id/verify" element={<DeliveryVerification />} />
          <Route path="/rider/deliveries/:id/success" element={<DeliverySuccess />} />
          {/* Marketing pages — shared Navbar + Footer */}
          <Route
            path="*"
            element={
              <>
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}