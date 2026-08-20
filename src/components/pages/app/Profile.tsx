import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, LogOut, Plus, Edit2 } from 'lucide-react';
import AppLayout from '../../app/AppLayout';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';
import {
  userApi,
  type UserProfile,
  type OrderOverview,
  type ReferralsMetrics,
} from '../../../app/lib/userApi';
import { logout } from '../../../app/lib/auth';
import { addressApi, type DeliveryAddress } from '../../../app/lib/addressApi';
import AddressModal from './AddressModal';
import { LogIn } from 'lucide-react';
import { isAuthenticated } from '../../../app/lib/auth';
export default function Profile() {
  const navigate = useNavigate();

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Accordion sections
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [referralsOpen, setReferralsOpen] = useState(false);

  // Section data (lazy loaded)
  const [orders, setOrders] = useState<OrderOverview[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [referrals, setReferrals] = useState<ReferralsMetrics | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
const [addressModalOpen, setAddressModalOpen] = useState(false);
const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    if (!isAuthenticated()) { setLoading(false); return; }
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfileOverview();
        setProfile(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const fetchAddresses = async () => {
  try {
    const res = await addressApi.getAddresses();
    setAddresses(res.data.data.deliveryAddresses ?? []);
  } catch {}
};

useEffect(() => {
  if (!isAuthenticated()) { setLoading(false); return; }
  fetchAddresses();
}, []); 

  // Lazy fetch orders when accordion opens
  useEffect(() => {
    if (ordersOpen && !orders && !ordersLoading) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError('');
        try {
          const res = await userApi.getOrdersOverview();
          setOrders(res.data.data.orders);
        } catch (err: any) {
          setOrdersError(err.response?.data?.message ?? 'Failed to load orders.');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [ordersOpen, orders, ordersLoading]);

  // Lazy fetch referrals when accordion opens
  useEffect(() => {
    if (referralsOpen && !referrals && !referralsLoading) {
      const fetchReferrals = async () => {
        setReferralsLoading(true);
        setReferralsError('');
        try {
          const res = await userApi.getReferralsOverview();
          setReferrals(res.data.data.metrics);
        } catch (err: any) {
          setReferralsError(err.response?.data?.message ?? 'Failed to load referrals.');
        } finally {
          setReferralsLoading(false);
        }
      };
      fetchReferrals();
    }
  }, [referralsOpen, referrals, referralsLoading]);

  // Helpers
  const firstName = profile?.profile?.firstName ?? '';
  const lastName = profile?.profile?.lastName ?? '';
  const fullName = firstName || lastName
    ? `${firstName} ${lastName}`.trim()
    : profile?.email ?? 'User';
  const photoUrl = profile?.profile?.profilePhoto?.url ?? null;
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : '';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const statusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  if (loading) {
    return (
      <AppLayout title="My Profile">
        <SplashLoader />
      </AppLayout>
    );
  }

if (!isAuthenticated()) {
  return (
    <AppLayout title="My Profile">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
        <LogIn size={40} className="text-primary" />
        <p className="text-lg font-semibold text-ink">Login to view your profile</p>
        <p className="text-sm text-ink-soft">
          Sign in to manage your addresses, see your order history, and track referrals.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Login
        </button>
      </div>
    </AppLayout>
  );
}
  if (error) {
    return (
      <AppLayout title="My Profile">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="My Profile">
      <div className="relative mx-auto max-w-2xl">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-6 h-28 w-28 rounded-full bg-blob-tan"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 bottom-20 h-24 w-24 rounded-full bg-primary/20"
        />

        {/* Avatar + name */}
        <div className="relative flex flex-col items-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={fullName}
              className="h-28 w-28 rounded-full border-4 border-primary object-cover shadow-md"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary bg-white text-4xl font-bold text-primary shadow-md">
              {initials || '👤'}
            </div>
          )}
          <h2 className="mt-4 text-2xl font-bold text-ink">{fullName}</h2>
        </div>

        {/* Contact cards */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <span className="text-xl" aria-hidden>📱</span>
              <span className="text-sm font-bold uppercase tracking-wide">Phone Number</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-ink">
              {profile?.phoneNumber ?? '—'}
            </p>
            <div className="mt-3 border-t border-muted/60" />
          </div>

          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-primary">
              <span className="text-xl" aria-hidden>✉</span>
              <span className="text-sm font-bold uppercase tracking-wide">Email Address</span>
            </div>
            <p className="mt-2 text-lg font-semibold text-ink">
              {profile?.email ?? '—'}
            </p>
            <div className="mt-3 border-t border-muted/60" />
          </div>
        </div>

        {/* ─── Accordions ─────────────────────────── */}
        <div className="mt-6 flex flex-col gap-3">
          {/* My Orders accordion */}
          <button
            type="button"
            onClick={() => setOrdersOpen((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
          >
            <span className="flex items-center gap-3 text-lg font-semibold text-ink">
              <span className="text-primary" aria-hidden>📋</span>
              My Orders
            </span>
            <span className="text-primary">
              {ordersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          {ordersOpen && (
            <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">
              {ordersLoading && (
                <p className="py-6 text-center text-sm font-medium text-primary animate-pulse">
                  Loading orders...
                </p>
              )}
              {ordersError && (
                <p className="py-4 text-center text-sm font-medium text-red-600">
                  {ordersError}
                </p>
              )}
              {orders && orders.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-sm text-ink-soft">No orders yet.</p>
                  <button
                    onClick={() => navigate('/app/shop')}
                    className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
              {orders && orders.length > 0 && (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-muted bg-white px-4 py-3"
                    >
                      <div>
                        <span className="inline-flex rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <p className="mt-1 text-xs text-ink-soft">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-ink">
                          {formatNaira(Number(order.totalPrice))} ·{' '}
                          {order.totalQuantityOfItems}{' '}
                          {order.totalQuantityOfItems === 1 ? 'item' : 'items'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.orderStatus)}`}
                      >
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/app/orders')}
                    className="mt-2 text-center text-sm font-semibold text-primary hover:underline"
                  >
                    View full order history ❯
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Referral Dashboard accordion */}
          <button
            type="button"
            onClick={() => setReferralsOpen((prev) => !prev)}
            className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
          >
            <span className="flex items-center gap-3 text-lg font-semibold text-ink">
              <span className="text-primary" aria-hidden>⛁</span>
              Referral Dashboard
            </span>
            <span className="text-primary">
              {referralsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          {referralsOpen && (
            <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">
              {referralsLoading && (
                <p className="py-6 text-center text-sm font-medium text-primary animate-pulse">
                  Loading referrals...
                </p>
              )}
              {referralsError && (
                <p className="py-4 text-center text-sm font-medium text-red-600">
                  {referralsError}
                </p>
              )}
              {referrals && (
                <div className="flex flex-col gap-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-primary/10 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {referrals.totalDirectReferrals}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink-soft">Total</p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {referrals.totalActiveReferrals}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink-soft">Active</p>
                    </div>
                    <div className="rounded-xl bg-primary/5 p-3 text-center">
                      <p className="text-sm font-bold text-primary break-all">
                        {referrals.referralCode}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink-soft">Your Code</p>
                    </div>
                  </div>

                  {/* Referrals list */}
                  {referrals.referrals.length === 0 ? (
                    <p className="py-4 text-center text-sm text-ink-soft">
                      No referrals yet. Share your code to start earning!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-bold text-ink">Your Referrals</p>
                      {referrals.referrals.map((person, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-muted bg-white px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {person.firstName} {person.lastName}
                            </p>
                            <p className="text-xs text-ink-soft">
                              Joined {formatDate(person.dateJoined)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              {person.numberOfDeliveredOrders} orders
                            </p>
                            <p className="text-xs text-ink-soft">
                              {formatNaira(Number(person.totalAmountOfDeliveredOrders))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View full dashboard button */}
                  <button
                    onClick={() => navigate('/app/referrals')}
                    className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    View Full Referral Dashboard ❯
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

       {/* Saved Addresses */}
<div className="mt-6">
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2 text-base font-semibold text-ink">
      <span aria-hidden>📍</span>
      Saved Addresses
    </span>
    <button
      type="button"
      onClick={() => {
        setEditingAddress(null);
        setAddressModalOpen(true);
      }}
      className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      <Plus size={14} /> Add New
    </button>
  </div>

  {addresses.length === 0 ? (
    <div className="mt-3 rounded-2xl bg-muted/60 p-5 text-center">
      <p className="text-sm text-ink-soft">No saved addresses yet.</p>
      <button
        onClick={() => {
          setEditingAddress(null);
          setAddressModalOpen(true);
        }}
        className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Add Your First Address
      </button>
    </div>
  ) : (
    <div className="mt-3 space-y-3">
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className="rounded-2xl bg-muted/60 p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-lg font-bold text-ink">{addr.nameOfCustomer}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {addr.addressLine}
              </p>
              <p className="text-sm text-ink-soft">
                {addr.state}, {addr.country}
              </p>
              {addr.phoneNumber && (
                <p className="mt-1 text-xs text-ink-soft">📞 {addr.phoneNumber}</p>
              )}
            </div>
            <button
              onClick={() => {
                setEditingAddress(addr);
                setAddressModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-400 bg-white px-5 py-4 text-lg font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut size={20} strokeWidth={2} />
          Logout
        </button>
        {/* Address modal */}
<AddressModal
  isOpen={addressModalOpen}
  onClose={() => setAddressModalOpen(false)}
  onSaved={fetchAddresses}
  address={editingAddress}
  defaultEmail={profile?.email ?? ''}
  defaultPhone={profile?.phoneNumber ?? ''}
/>
      </div>
    </AppLayout>
  );
}