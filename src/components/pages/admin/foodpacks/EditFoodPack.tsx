import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Camera, Trash2, Plus } from 'lucide-react';

type PackProduct = {
  id: string;
  name: string;
  meta: string;
  icon: string;
};

const initialProducts: PackProduct[] = [
  { id: '1', name: 'Whole Chicken', meta: 'Quantity: 2', icon: '🍗' },
  { id: '2', name: 'Eggs', meta: '2 Crates', icon: '🥚' },
  { id: '3', name: 'Beef', meta: '3kg', icon: '🥩' },
];

export default function EditFoodPack() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState('Protein Power Bundle');
  const [products, setProducts] = useState(initialProducts);
  const [marketValue, setMarketValue] = useState(28000);
  const [sellingPrice, setSellingPrice] = useState(24500);

  const savings = marketValue - sellingPrice;
  const savingsPct = marketValue ? Math.round((savings / marketValue) * 100) : 0;

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-28">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Edit Food Pack</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div className="relative h-40 w-full overflow-hidden rounded-2xl">
          <img
            src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800"
            alt="Protein Power Bundle"
            className="h-full w-full object-cover"
          />
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center">
            <input type="file" accept="image/*" className="hidden" />
            <span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">
              <Camera size={14} />
              Change Photo
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#F3F7EE] p-4">
          <p className="text-sm font-semibold text-gray-700">Pack Visibility</p>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${visible ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                visible ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Pack Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-[#F3F7EE]/40 px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-primary"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Included Products</p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Plus size={14} />
              Add Product
            </button>
          </div>
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F7EE] text-lg">
                  {p.icon}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.meta}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-400">
            PRICE CONFIGURATION
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Market Value (₦)</label>
              <input
                type="number"
                value={marketValue}
                onChange={(e) => setMarketValue(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-800 outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Selling Price (₦)</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-primary bg-[#F3F7EE]/60 px-3 py-2.5 text-sm font-semibold text-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-primary/10 p-4">
          <div className="flex items-center gap-2">
            <span className="text-primary">↘</span>
            <div>
              <p className="text-xs text-gray-500">TOTAL SAVINGS</p>
              <p className="text-lg font-bold text-primary">₦{savings.toLocaleString()}</p>
            </div>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
            {savingsPct}% OFF
          </span>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 py-3.5 text-sm font-semibold text-red-500"
        >
          <Trash2 size={16} />
          Delete Food Pack permanently
        </button>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex gap-3 border-t border-gray-100 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate(`/admin/food-packs/${id}`)}
          className="flex-1 rounded-full bg-gray-100 py-3.5 text-sm font-semibold text-gray-500"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/food-packs/${id}`)}
          className="flex-1 rounded-full bg-primary py-3.5 text-sm font-semibold text-white"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
