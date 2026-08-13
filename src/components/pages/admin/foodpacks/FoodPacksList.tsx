import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Search, Pencil, Plus } from 'lucide-react';
import AdminBottomNav from '../../../admin/AdminBottomNav';

type Pack = {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  featured?: boolean;
  saveTag?: string;
  name: string;
  desc: string;
  products: number;
  price: string;
  original?: string;
  img: string;
};

const packs: Pack[] = [
  {
    id: '1',
    status: 'ACTIVE',
    featured: true,
    saveTag: 'SAVE 15%',
    name: 'Family Harvest Pack',
    desc: 'A weekly selection of essential tubers and grains for medium families.',
    products: 12,
    price: '₦45,000',
    original: '₦52,000',
    img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
  },
  {
    id: '2',
    status: 'ACTIVE',
    saveTag: 'SAVE 10%',
    name: 'Vegetable Oasis Box',
    desc: 'Directly sourced organic leafy greens and antioxidant-rich vegetables.',
    products: 8,
    price: '₦18,500',
    original: '₦20,550',
    img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  },
  {
    id: '3',
    status: 'INACTIVE',
    name: 'Dry Season Bundle',
    desc: 'Bulk staples designed for long-term storage during off-seasons.',
    products: 15,
    price: '₦62,000',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
  },
];

const filters = ['All', 'Active', 'Inactive', 'Featured', 'Seasonal'];

export default function FoodPacksList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Food Packs</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="px-5 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3">
          <Search size={18} className="text-gray-400" />
          <input
            placeholder="Search food packs..."
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
              activeFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 space-y-4 px-5 pb-28 pt-5">
        {packs.map((pack) => (
          <div
            key={pack.id}
            className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="relative h-40 w-full">
              <img src={pack.img} alt={pack.name} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white ${
                    pack.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-500'
                  }`}
                >
                  {pack.status}
                </span>
                {pack.featured && (
                  <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    Featured
                  </span>
                )}
                {pack.saveTag && (
                  <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    {pack.saveTag}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-gray-600"
              >
                <MoreVertical size={14} />
              </button>
            </div>

            <div
              className="cursor-pointer p-4"
              onClick={() => navigate(`/admin/food-packs/${pack.id}`)}
            >
              <h3 className="font-bold text-gray-900">{pack.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{pack.desc}</p>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-sm text-gray-500">{pack.products} Products</span>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-bold text-primary">{pack.price}</p>
                    {pack.original && (
                      <p className="text-xs text-gray-300 line-through">{pack.original}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/food-packs/${pack.id}/edit`);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      <button
        type="button"
        onClick={() => navigate('/admin/food-packs/create')}
        className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        aria-label="Create food pack"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      <AdminBottomNav />
    </div>
  );
}
