import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Phone, MapPin, Star, UserPlus } from 'lucide-react';
import {
  adminRiderApi,
  extractRidersList,
  type DeliveryRider,
} from '../../../../app/lib/adminRiderApi';

const filters = ['All', 'Online', 'Available', 'Busy', 'Suspended'];

export default function RidersOverview() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<DeliveryRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    adminRiderApi
      .getDeliveryRiders()
      .then((res) => setRiders(extractRidersList(res.data.data)))
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load riders.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = riders.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || r.fullname.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);

    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Online' && r.isOnline) ||
      (activeFilter === 'Suspended' && r.isSuspended) ||
      (activeFilter === 'Available' && r.status === 'AVAILABLE') ||
      (activeFilter === 'Busy' && r.status === 'BUSY');

    return matchesSearch && matchesFilter;
  });

  const totals = {
    total: riders.length,
    online: riders.filter((r) => r.isOnline).length,
    available: riders.filter((r) => r.status === 'AVAILABLE').length,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <Menu size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Rider Management</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/riders/onboard')}
          aria-label="Onboard rider"
          className="text-primary-dark"
        >
          <UserPlus size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="mt-4 flex gap-3 overflow-x-auto px-5 pb-1 scrollbar-hide">
        <div className="min-w-[110px] rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-xl font-extrabold text-primary">{totals.total}</p>
        </div>
        <div className="min-w-[110px] rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Online</p>
          <p className="text-xl font-extrabold text-primary">{totals.online}</p>
        </div>
        <div className="min-w-[110px] rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400">Available</p>
          <p className="text-xl font-extrabold text-primary">{totals.available}</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or zone"
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeFilter === f ? 'bg-primary text-white' : 'bg-white text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-3 px-5 pb-6 pt-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}
        {loading && <p className="py-10 text-center text-sm text-gray-400">Loading riders...</p>}
        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No riders found.</p>
        )}

        {!loading &&
          filtered.map((rider) => (
            <div key={rider.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={rider.profilePictureUrl || `https://i.pravatar.cc/80?u=${rider.id}`}
                      alt={rider.fullname}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        rider.isOnline ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{rider.fullname}</p>
                    <p className="text-xs text-gray-400">ID: {rider.id.slice(0, 8).toUpperCase()}</p>
                    <div className="mt-1 flex gap-1.5">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        {rider.isStudent ? 'STUDENT' : 'NON-STUDENT'}
                      </span>
                      {rider.isSuspended ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                          SUSPENDED
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            rider.isOnline
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rider.isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-400" />
                  {rider.phoneNumberOne}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  {rider.zone ?? rider.address}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>{rider.activeOrders ?? 0} Active Orders</span>
                {rider.rating !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {rider.rating}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate(`/admin/riders/${rider.id}`)}
                className="mt-3 w-full rounded-full bg-[#F3F7EE] py-2.5 text-sm font-semibold text-primary-dark"
              >
                View Details
              </button>
            </div>
          ))}
      </main>
    </div>
  );
}
