import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, TrendingUp, Wallet, ChevronRight, Pencil, EyeOff, Eye, Trash2 } from 'lucide-react';
import {
  adminFoodPackApi,
  type AdminFoodPackDetail,
} from '../../../../app/lib/adminFoodPackApi';

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`;
}

export default function FoodPackDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pack, setPack] = useState<AdminFoodPackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPack = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminFoodPackApi.getFoodPackById(id);
      setPack(res.data.data.foodpack);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load food pack.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleHide = async () => {
    if (!id || !pack) return;
    setActionLoading(true);
    try {
      await adminFoodPackApi.updateFoodPack(id, { visibleToCustomers: pack.isHidden });
      fetchPack();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update visibility.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Delete this food pack permanently? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await adminFoodPackApi.deleteFoodPack(id);
      navigate('/admin/food-packs');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete food pack.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading food pack...</p>
      </div>
    );
  }

  if (error || !pack) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-red-500">{error || 'Food pack not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

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

      <div className="relative h-56 w-full bg-gray-100">
        {pack.imageUrls?.[0] && (
          <img src={pack.imageUrls[0]} alt={pack.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
              pack.status === 'ACTIVE' ? 'bg-primary' : 'bg-gray-500'
            }`}
          >
            {pack.status}
          </span>
          {pack.featuredPack && (
            <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
              FEATURED
            </span>
          )}
        </div>
      </div>

      <main className="flex-1 space-y-4 px-5 pt-5">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-dark">{pack.name}</h2>
          <p className="mt-2 text-sm text-gray-500">{pack.description}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Selling Price</p>
              <p className="text-2xl font-extrabold text-primary">{formatPrice(pack.price)}</p>
            </div>
            {pack.originalPrice > pack.price && (
              <div className="text-right">
                <p className="text-xs text-gray-400 line-through">
                  Original: {formatPrice(pack.originalPrice)}
                </p>
                <p className="text-sm font-bold text-red-500">
                  Save {formatPrice(pack.originalPrice - pack.price)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp size={14} className="text-primary" />
              Orders Sold
            </div>
            <p className="mt-1 text-xl font-extrabold text-gray-900">{pack.ordersSold}</p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Wallet size={14} className="text-primary" />
              Revenue
            </div>
            <p className="mt-1 text-xl font-extrabold text-gray-900">
              {formatPrice(pack.revenue)}
            </p>
          </div>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Products Included</h3>
            <span className="text-sm text-gray-400">{pack.items.length} Items</span>
          </div>
          <div className="space-y-2">
            {pack.items.map((p) => (
              <div key={p.id} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                {p.imageUrls?.[0] && (
                  <img src={p.imageUrls[0]} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                )}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">Qty: {p.quantity}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </div>
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
              disabled={actionLoading}
              onClick={handleToggleHide}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-200 py-3.5 text-sm font-semibold text-gray-500 disabled:opacity-60"
            >
              {pack.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
              {pack.isHidden ? 'Unhide' : 'Hide'}
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 py-3.5 text-sm font-semibold text-red-500 disabled:opacity-60"
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