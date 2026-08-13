import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Camera, Plus, Minus, Search, Star, Eye, Rocket } from 'lucide-react';

type SelectedProduct = {
  name: string;
  price: number;
  unit: string;
  qty: number;
  img: string;
};

const initialProducts: SelectedProduct[] = [
  { name: 'Thai Jasmine Rice', price: 14500, unit: '/ unit', qty: 2, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200' },
  { name: 'Premium Veg Oil (3L)', price: 3500, unit: '/ unit', qty: 1, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200' },
];

export default function CreateFoodPack() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [sellingPrice, setSellingPrice] = useState(28000);
  const [featured, setFeatured] = useState(true);
  const [visible, setVisible] = useState(true);

  const bundleValue = products.reduce((sum, p) => sum + p.price * p.qty, 0);
  const savings = bundleValue - sellingPrice;
  const savingsPct = bundleValue ? Math.round((savings / bundleValue) * 100) : 0;

  const updateQty = (name: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.name === name ? { ...p, qty: Math.max(0, p.qty + delta) } : p))
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Create Pack</h1>
        <button type="button" className="text-primary-dark">
          <MoreVertical size={22} strokeWidth={2} />
        </button>
      </header>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Banner Image</p>
          <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-center">
            <input type="file" accept="image/*" className="hidden" />
            <Camera size={22} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Upload Banner Image</span>
            <span className="text-xs text-gray-400">16:9 ratio, Max 5MB</span>
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Pack Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Family Essential Bundle"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what makes this food pack special..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-primary"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Product Selection</p>
            <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Plus size={14} />
              Add Products
            </button>
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search available inventory..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-2.5">
                <img src={p.img} alt={p.name} className="h-11 w-11 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    ₦{p.price.toLocaleString()} {p.unit}
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-full bg-[#F3F7EE] px-2 py-1">
                  <button type="button" onClick={() => updateQty(p.name, -1)} className="text-primary">
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-gray-800">{p.qty}</span>
                  <button type="button" onClick={() => updateQty(p.name, 1)} className="text-primary">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Pricing Engine</p>
          <div className="space-y-3 rounded-2xl bg-primary p-4 text-white">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span>Bundle Value</span>
              <span className="font-semibold text-white">₦{bundleValue.toLocaleString()}</span>
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-white">Selling Price</p>
              <div className="flex items-center rounded-xl bg-white/10 px-4 py-2.5">
                <span className="mr-1 text-white/80">₦</span>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full bg-transparent text-white outline-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Customer Savings</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                ₦{savings.toLocaleString()} ({savingsPct}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#F3F7EE] p-4">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Featured Pack</p>
              <p className="text-xs text-gray-400">Pin to top of home screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeatured((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${featured ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                featured ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-[#F3F7EE] p-4">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-primary" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Visibility</p>
              <p className="text-xs text-gray-400">Visible to all customers</p>
            </div>
          </div>
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

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary py-3.5 text-sm font-semibold text-primary"
        >
          <Eye size={16} />
          Preview Pack
        </button>

        <button
          type="button"
          onClick={() => navigate('/admin/food-packs')}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-semibold text-white"
        >
          <Rocket size={16} />
          Publish Food Pack
        </button>
      </main>
    </div>
  );
}
