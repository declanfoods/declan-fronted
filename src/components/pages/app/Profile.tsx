import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  LogOut,
  Plus,
  Edit2,
  LogIn,
  Camera,
  Loader2,
  Trash2,
} from 'lucide-react';

import AppLayout from '../../app/AppLayout';
import SplashLoader from '../../ui/SplashLoader';
import { formatNaira } from '../../data/products';

import {
  userApi,
  userAvatarUrl,
  type UserProfile,
  type OrderOverview,
  type ReferralsMetrics,
} from '../../../app/lib/userApi';

import { uploadApi, extractUploadedUrl } from '../../../app/lib/adminUploadApi';
import {
  readAvatarOverride,
  writeAvatarOverride,
} from '../../../app/lib/userAvatar';

import { logout, isAuthenticated } from '../../../app/lib/auth';

import {
  addressApi,
  type DeliveryAddress,
} from '../../../app/lib/addressApi';

import AddressModal from './AddressModal';

export default function Profile() {
  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // Profile
  // ─────────────────────────────────────────────

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─────────────────────────────────────────────
  // Profile picture
  // ─────────────────────────────────────────────

  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /*
    Load any locally-chosen picture for this user. Runs after the profile
    arrives, because the override is keyed by user id.
  */
  useEffect(() => {
    if (profile?.id) {
      setAvatarOverride(readAvatarOverride(profile.id));
    }
  }, [profile?.id]);

  /*
    Uploads a chosen file through the ONE upload endpoint the API has
    (POST /api/v1/files, multipart field "files") and shows it immediately.

    Validated before the round-trip so a 12 MB RAW file never leaves the
    device: 5 MB ceiling and images only, matching what the admin upload
    widget allows.
  */
  const handlePhotoSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Let the same file be picked again after a failure.
    event.target.value = '';
    if (!file || !profile?.id) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('That image is larger than 5MB. Please choose a smaller one.');
      return;
    }

    setUploadingPhoto(true);

    try {
      const res = await uploadApi.uploadFile(file);
      const url = extractUploadedUrl(res.data.data);

      if (!url) {
        toast.error('The upload succeeded but no image URL came back.');
        return;
      }

      /*
        TODO(backend): replace this with a real save once an endpoint exists.
        Right now the URL is only kept on this device — see userAvatar.ts.
      */
      writeAvatarOverride(profile.id, url);
      setAvatarOverride(url);

      toast.success('Profile picture updated.');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? 'Could not upload the picture.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (!profile?.id) return;

    writeAvatarOverride(profile.id, null);
    setAvatarOverride(null);
    toast.success('Profile picture removed.');
  };

  // ─────────────────────────────────────────────
  // Accordions
  // ─────────────────────────────────────────────

  const [ordersOpen, setOrdersOpen] = useState(false);
  const [referralsOpen, setReferralsOpen] = useState(false);

  // ─────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────

  const [orders, setOrders] = useState<OrderOverview[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // ─────────────────────────────────────────────
  // Referrals
  // ─────────────────────────────────────────────

  const [referrals, setReferrals] =
    useState<ReferralsMetrics | null>(null);

  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');

  // ─────────────────────────────────────────────
  // Addresses
  // ─────────────────────────────────────────────

  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<DeliveryAddress | null>(null);

  // ─────────────────────────────────────────────
  // Fetch profile
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfileOverview();

        console.log('PROFILE API RESPONSE:', res.data);

        // API response:
        //
        // data: {
        //   user: {
        //     id,
        //     email,
        //     phoneNumber,
        //     profile: {
        //       firstName,
        //       lastName
        //     },
        //     deliveryAddresses: []
        //   }
        // }

        const user = res.data.data.user;

        setProfile(user);

        // The API already returns the user's addresses.
        setAddresses(user.deliveryAddresses ?? []);
      } catch (err: any) {
        setError(
          err.response?.data?.message ??
            'Failed to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ─────────────────────────────────────────────
  // Fetch addresses
  // ─────────────────────────────────────────────

  const fetchAddresses = async () => {
    try {
      const res = await addressApi.getAddresses();

      setAddresses(
        res.data.data.deliveryAddresses ?? []
      );
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  // ─────────────────────────────────────────────
  // Orders lazy loading
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!ordersOpen || orders || ordersLoading) return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');

      try {
        const res = await userApi.getOrdersOverview();

        setOrders(res.data.data.orders ?? []);
      } catch (err: any) {
        setOrdersError(
          err.response?.data?.message ??
            'Failed to load orders.'
        );
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [ordersOpen, orders, ordersLoading]);

  // ─────────────────────────────────────────────
  // Referrals lazy loading
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (
      !referralsOpen ||
      referrals ||
      referralsLoading
    ) {
      return;
    }

    const fetchReferrals = async () => {
      setReferralsLoading(true);
      setReferralsError('');

      try {
        const res =
          await userApi.getReferralsOverview();

        setReferrals(
          res.data.data.metrics
        );
      } catch (err: any) {
        setReferralsError(
          err.response?.data?.message ??
            'Failed to load referrals.'
        );
      } finally {
        setReferralsLoading(false);
      }
    };

    fetchReferrals();
  }, [
    referralsOpen,
    referrals,
    referralsLoading,
  ]);

  // ─────────────────────────────────────────────
  // Profile helpers
  // ─────────────────────────────────────────────

  const firstName =
    profile?.profile?.firstName ?? '';

  const lastName =
    profile?.profile?.lastName ?? '';

  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : profile?.email ?? 'User';

  /*
    The real avatar. `userAvatarUrl` reads the flat `profilePictureUrl` the API
    actually sends; the previous code read `profile.profile.profilePhoto.url`,
    a field that does not exist anywhere in the API, which is why this screen
    always showed initials.

    `avatarOverride` is a device-local value set by the upload below — see
    `app/lib/userAvatar.ts` for why, and for the two-line change that removes
    it once the backend can store the URL.
  */
  const photoUrl = avatarOverride ?? userAvatarUrl(profile);

  const initials =
    firstName || lastName
      ? `${firstName.charAt(0)}${lastName.charAt(
          0
        )}`.toUpperCase()
      : '';

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────

  if (loading) {
    return (
      <AppLayout title="My Profile">
        <SplashLoader />
      </AppLayout>
    );
  }

  // ─────────────────────────────────────────────
  // Not authenticated
  // ─────────────────────────────────────────────

  if (!isAuthenticated()) {
    return (
      <AppLayout title="My Profile">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <LogIn
            size={40}
            className="text-primary"
          />

          <p className="text-lg font-semibold text-ink">
            Login to view your profile
          </p>

          <p className="text-sm text-ink-soft">
            Sign in to manage your addresses, see
            your order history, and track referrals.
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Login
          </button>
        </div>
      </AppLayout>
    );
  }

  // ─────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────

  if (error) {
    return (
      <AppLayout title="My Profile">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-lg font-semibold text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    );
  }

  // ─────────────────────────────────────────────
  // Main
  // ─────────────────────────────────────────────

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

        {/* Avatar */}

        <div className="relative flex flex-col items-center">
          <div className="relative">
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

            {/*
              The picker. A native file input behind a styled button, so it
              opens the phone's photo library / camera on mobile rather than a
              file browser.
            */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoSelected}
            />

            <button
              type="button"
              disabled={uploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
              aria-label={photoUrl ? 'Change profile picture' : 'Add a profile picture'}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-md transition-transform hover:scale-105 disabled:opacity-60"
            >
              {uploadingPhoto ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
          </div>

          {/* Only offered when there is actually something to remove. */}
          {photoUrl && !uploadingPhoto && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500"
            >
              <Trash2 size={13} />
              Remove picture
            </button>
          )}

          <h2 className="mt-4 text-2xl font-bold text-ink">
            {fullName}
          </h2>
        </div>

        {/* Contact cards */}

        <div className="mt-8 flex flex-col gap-4">

          {/* Phone */}

          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3 text-primary">
              <span
                className="text-xl"
                aria-hidden
              >
                📱
              </span>

              <span className="text-sm font-bold uppercase tracking-wide">
                Phone Number
              </span>
            </div>

            <p className="mt-2 text-lg font-semibold text-ink">
              {profile?.phoneNumber ?? '—'}
            </p>

            <div className="mt-3 border-t border-muted/60" />
          </div>

          {/* Email */}

          <div className="rounded-2xl border-2 border-primary bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3 text-primary">
              <span
                className="text-xl"
                aria-hidden
              >
                ✉
              </span>

              <span className="text-sm font-bold uppercase tracking-wide">
                Email Address
              </span>
            </div>

            <p className="mt-2 break-all text-lg font-semibold text-ink">
              {profile?.email ?? '—'}
            </p>

            <div className="mt-3 border-t border-muted/60" />
          </div>
        </div>

        {/* ─────────────────────────────────────── */}
        {/* Orders */}
        {/* ─────────────────────────────────────── */}

        <div className="mt-6 flex flex-col gap-3">

          <button
            type="button"
            onClick={() =>
              setOrdersOpen((prev) => !prev)
            }
            className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
          >
            <span className="flex items-center gap-3 text-lg font-semibold text-ink">
              <span
                className="text-primary"
                aria-hidden
              >
                📋
              </span>

              My Orders
            </span>

            <span className="text-primary">
              {ordersOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </span>
          </button>

          {ordersOpen && (
            <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">

              {ordersLoading && (
                <p className="animate-pulse py-6 text-center text-sm font-medium text-primary">
                  Loading orders...
                </p>
              )}

              {ordersError && (
                <p className="py-4 text-center text-sm font-medium text-red-600">
                  {ordersError}
                </p>
              )}

              {orders &&
                orders.length === 0 && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-ink-soft">
                      No orders yet.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate('/app/shop')
                      }
                      className="mt-3 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}

              {orders &&
                orders.length > 0 && (
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
                            {formatDate(
                              order.createdAt
                            )}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-ink">
                            {formatNaira(
                              Number(
                                order.totalPrice
                              )
                            )}{' '}
                            ·{' '}
                            {
                              order.totalQuantityOfItems
                            }{' '}
                            {order.totalQuantityOfItems ===
                            1
                              ? 'item'
                              : 'items'}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus.replace(
                            /_/g,
                            ' '
                          )}
                        </span>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        navigate('/app/orders')
                      }
                      className="mt-2 text-center text-sm font-semibold text-primary hover:underline"
                    >
                      View full order history ❯
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* ───────────────────────────────────── */}
          {/* Referrals */}
          {/* ───────────────────────────────────── */}

          <button
            type="button"
            onClick={() =>
              setReferralsOpen((prev) => !prev)
            }
            className="flex items-center justify-between rounded-2xl border-2 border-primary bg-white px-5 py-4 text-left shadow-sm transition-colors hover:bg-primary/5"
          >
            <span className="flex items-center gap-3 text-lg font-semibold text-ink">
              <span
                className="text-primary"
                aria-hidden
              >
                ⛁
              </span>

              Referral Dashboard
            </span>

            <span className="text-primary">
              {referralsOpen ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </span>
          </button>

          {referralsOpen && (
            <div className="rounded-2xl border-2 border-primary/30 bg-white p-4 shadow-sm">

              {referralsLoading && (
                <p className="animate-pulse py-6 text-center text-sm font-medium text-primary">
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

                  <div className="grid grid-cols-3 gap-3">

                    <div className="rounded-xl bg-primary/10 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {referrals.totalDirectReferrals}
                      </p>

                      <p className="mt-1 text-xs font-medium text-ink-soft">
                        Total
                      </p>
                    </div>

                    <div className="rounded-xl bg-green-50 p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {referrals.totalActiveReferrals}
                      </p>

                      <p className="mt-1 text-xs font-medium text-ink-soft">
                        Active
                      </p>
                    </div>

                    <div className="rounded-xl bg-primary/5 p-3 text-center">
                      <p className="break-all text-sm font-bold text-primary">
                        {referrals.referralCode}
                      </p>

                      <p className="mt-1 text-xs font-medium text-ink-soft">
                        Your Code
                      </p>
                    </div>
                  </div>

                  {referrals.referrals.length ===
                  0 ? (
                    <p className="py-4 text-center text-sm text-ink-soft">
                      No referrals yet. Share your
                      code to start earning!
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">

                      <p className="text-sm font-bold text-ink">
                        Your Referrals
                      </p>

                      {referrals.referrals.map(
                        (person, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-muted bg-white px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {person.firstName}{' '}
                                {person.lastName}
                              </p>

                              <p className="text-xs text-ink-soft">
                                Joined{' '}
                                {formatDate(
                                  person.dateJoined
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">
                                {
                                  person.numberOfDeliveredOrders
                                }{' '}
                                orders
                              </p>

                              <p className="text-xs text-ink-soft">
                                {formatNaira(
                                  Number(
                                    person.totalAmountOfDeliveredOrders
                                  )
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/*
                    FIX: this used to be a client-side navigate(), which
                    replaced the Profile page. Now it opens the full referral
                    dashboard in a NEW TAB so the customer keeps their
                    profile screen open.

                    It's a real <a> with target="_blank" — not a button with
                    window.open(). Anchors survive popup blockers; window.open()
                    gets silently blocked in many mobile browsers.
                  */}
                  <a
                    href="/app/referrals"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                  >
                    View Full Referral Dashboard ❯
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────── */}
        {/* Saved Addresses */}
        {/* ─────────────────────────────────────── */}

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
              <Plus size={14} />
              Add New
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-muted/60 p-5 text-center">

              <p className="text-sm text-ink-soft">
                No saved addresses yet.
              </p>

              <button
                type="button"
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

                      <p className="text-lg font-bold text-ink">
                        {addr.nameOfCustomer ??
                          fullName}
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {addr.addressLine ??
                          'No address'}
                      </p>

                      <p className="text-sm text-ink-soft">
                        {addr.state ?? ''},{' '}
                        {addr.country ?? ''}
                      </p>

                      {addr.phoneNumber && (
                        <p className="mt-1 text-xs text-ink-soft">
                          📞 {addr.phoneNumber}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(addr);
                        setAddressModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────── */}
        {/* Logout */}
        {/* ─────────────────────────────────────── */}

        <button
          type="button"
          onClick={logout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-400 bg-white px-5 py-4 text-lg font-semibold text-red-500 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut
            size={20}
            strokeWidth={2}
          />
          Logout
        </button>

        {/* ─────────────────────────────────────── */}
        {/* Address Modal */}
        {/* ─────────────────────────────────────── */}

        <AddressModal
          isOpen={addressModalOpen}
          onClose={() =>
            setAddressModalOpen(false)
          }
          onSaved={fetchAddresses}
          address={editingAddress}
          defaultEmail={profile?.email ?? ''}
          defaultPhone={
            profile?.phoneNumber ?? ''
          }
        />
      </div>
    </AppLayout>
  );
}