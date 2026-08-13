import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, TrendingUp, Wallet, ChevronRight, Pencil, EyeOff, Trash2 } from 'lucide-react';

const products = [
  { name: 'Yam', meta: '2kg • Large Grade', img: 'https://images.unsplash.com/photo-1591121213515-2fa5e2b1d3f9?w=200' },
  { name: 'Rice', meta: '5kg • Premium Long Grain', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
  { name: 'Tomatoes', meta: '1 Basket • Fresh Harvest', img: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=200' },
];

export default function FoodPackDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F7EE] pb-10">
      <header className="flex items-center justify-between bg-white px-5 pt-6 pb-2">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Pack Details</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="relative h-56 w-full">
        <img
          src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800"
          alt="Family Harvest Pack"
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">ACTIVE</span>
          <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">FEATURED</span>
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-dark">Family Harvest Pack</h2>
          <p className="mt-2 text-sm text-gray-500">
            A comprehensive nutritional selection designed to support a family of four for two
            weeks. Includes essential tubers, grains, and fresh produce sourced directly from
            regional farms.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Selling Price</p>
              <p className="text-2xl font-extrabold text-primary">₦45,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 line-through">Original: ₦52,000</p>
              <p className="text-sm font-bold text-red-500">Save ₦7,000</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp size={14} className="text-primary" />
              Orders Sold
            </div>
            <p className="mt-1 text-xl font-extrabold text-gray-900">124</p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Wallet size={14} className="text-primary" />
              Revenue
            </div>
            <p className="mt-1 text-xl font-extrabold text-gray-900">₦5.58M</p>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Products Included</h3>
            <span className="text-sm text-gray-400">{products.length} Items</span>
          </div>
          <div className="space-y-2">
            {products.map((p) => (
              <button
                key={p.name}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <img src={p.img} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.meta}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/food-packs/${id}/edit`)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
          >
            <Pencil size={16} />
            Edit Food Pack
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-200 py-3.5 text-sm font-semibold text-gray-500"
            >
              <EyeOff size={16} />
              Hide
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 py-3.5 text-sm font-semibold text-red-500"
            >
              <Trash2 size={16} />
              Delete Food Pack
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
