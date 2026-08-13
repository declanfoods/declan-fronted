import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Search, SlidersHorizontal, ShoppingBag, Navigation } from 'lucide-react';

const riders = [
  {
    name: 'Bolanle J.',
    avatar: 'https://i.pravatar.cc/80?img=13',
    topRated: true,
    rating: 4.8,
    activeOrders: 2,
    distance: '5 mins away',
    vehicle: 'Honda XL',
    busy: false,
  },
  {
    name: 'Chidi O.',
    avatar: 'https://i.pravatar.cc/80?img=15',
    topRated: false,
    rating: 4.9,
    activeOrders: 0,
    distance: '8 mins away',
    vehicle: 'EV Scooter',
    busy: false,
  },
  {
    name: 'Sarah K.',
    avatar: 'https://i.pravatar.cc/80?img=47',
    topRated: false,
    rating: 4.7,
    activeOrders: 3,
    distance: '12 mins away',
    vehicle: 'Corolla Hatch',
    busy: true,
  },
];

export default function AssignRider() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Assign Rider</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="flex items-center gap-2 px-5 pt-4">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-gray-200 px-4 py-3">
          <Search size={16} className="text-gray-400" />
          <input
            placeholder="Search by name or ID..."
            className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="mt-5 px-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Nearby Riders</h2>
          <span className="text-xs font-semibold text-primary">LIVE VIEW</span>
        </div>
        <div className="relative h-40 overflow-hidden rounded-2xl bg-[#DCEEDB]">
          <img
            src="https://staticmapmaker.com/img/google-map-placeholder.png"
            alt="Riders map"
            className="h-full w-full object-cover opacity-70"
          />
          <span className="absolute left-[30%] top-[40%] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow">
            🛵
          </span>
          <span className="absolute left-[60%] top-[55%] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-primary shadow">
            🛵
          </span>
        </div>
      </div>

      <div className="mt-3 px-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F7EE] px-3 py-1.5 text-xs font-semibold text-primary-dark">
          <ShoppingBag size={14} />
          Order #{id ?? 'DF-9021'} • Tunde Kelani
        </span>
      </div>

      <div className="mt-5 flex-1 space-y-3 px-5">
        <h2 className="text-sm font-bold text-gray-900">Suggested Riders</h2>
        {riders.map((rider) => (
          <div
            key={rider.name}
            className={`rounded-2xl border p-4 ${
              rider.busy ? 'border-gray-100 bg-gray-50' : 'border-gray-100 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      rider.busy ? 'bg-red-500' : 'bg-primary'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{rider.name}</p>
                    {rider.topRated && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        TOP RATED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    ★ {rider.rating} · {rider.activeOrders} active orders
                    {rider.busy && <span className="text-red-500"> (Busy)</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-primary">
                  <Navigation size={12} />
                  {rider.distance}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400">{rider.vehicle}</span>
              <button
                type="button"
                disabled={rider.busy}
                onClick={() => navigate(`/admin/orders/${id}`)}
                className={`rounded-full px-6 py-2 text-sm font-semibold ${
                  rider.busy
                    ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                    : 'bg-primary text-white'
                }`}
              >
                Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg"
      >
        <Navigation size={18} />
      </button>
    </div>
  );
}
