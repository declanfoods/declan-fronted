import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Trash2, Plus, Search } from 'lucide-react';
import {
  adminFoodPackApi,
  type AdminFoodPackDetail,
} from '../../../../app/lib/adminFoodPackApi';
import { adminProductApi, type AdminProduct } from '../../../../app/lib/adminProductApi';
import AdminImageUpload from '../../../admin/AdminImageUpload';

export default function EditFoodPack() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [pack, setPack] = useState<AdminFoodPackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [visible, setVisible] = useState(true);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sellingPrice, setSellingPrice] = useState(0);

  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<AdminProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [itemBusyId, setItemBusyId] = useState<string | null>(null);

  const fetchPack = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminFoodPackApi.getFoodPackById(id);
      const p = res.data.data.foodpack;
      setPack(p);
      setName(p.name);
      setImageUrl(p.imageUrls?.[0] ?? '');
      setSellingPrice(p.price);
      setVisible(!p.isHidden);
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

  useEffect(() => {
    if (!productSearch) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      adminProductApi
        .getProducts({ search: productSearch, limit: 6 })
        .then((res) => setSearchResults(res.data.data.products))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timeout);
  }, [productSearch]);

  const marketValue = pack ? pack.originalPrice : 0;
  const savings = marketValue - sellingPrice;
  const savingsPct = marketValue ? Math.round((savings / marketValue) * 100) : 0;

  const handleAddProduct = async (product: AdminProduct) => {
    if (!id) return;
    setError('');
    try {
      await adminFoodPackApi.addItems(id, {
        items: [{ productId: product.id, quantity: 1 }],
      });
      setProductSearch('');
      setSearchResults([]);
      fetchPack();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to add item.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!id) return;
    setItemBusyId(itemId);
    setError('');
    try {
      await adminFoodPackApi.removeItem(id, itemId);
      fetchPack();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to remove item.');
    } finally {
      setItemBusyId(null);
    }
  };

  const handleSave = async () => {
    if (!id || !pack) return;
    setSaving(true);
    setError('');
    try {
      await adminFoodPackApi.updateFoodPack(id, {
        name,
        imageUrls: imageUrl ? [imageUrl] : undefined,
        price: sellingPrice !== pack.price ? sellingPrice : undefined,
        visibleToCustomers: visible,
      });
      navigate(`/admin/food-packs/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Delete this food pack permanently? This cannot be undone.')) return;
    try {
      await adminFoodPackApi.deleteFoodPack(id);
      navigate('/admin/food-packs');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to delete food pack.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading food pack...</p>
      </div>
    );
  }

  if (!pack) {
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
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <AdminImageUpload value={imageUrl} onChange={setImageUrl} heightClassName="h-40" />

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
          </div>

          <div className="relative mb-3">
            <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
              <Search size={16} className="text-gray-400" />
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search inventory to add a product..."
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
            {productSearch && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg">
                {searching && <p className="p-3 text-sm text-gray-400">Searching...</p>}
                {!searching && searchResults.length === 0 && (
                  <p className="p-3 text-sm text-gray-400">No products found.</p>
                )}
                {!searching &&
                  searchResults.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-gray-50"
                    >
                      {product.imageUrls?.[0] && (
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="h-9 w-9 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                      </div>
                      <Plus size={16} className="text-primary" />
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {pack.items.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
              >
                {p.imageUrls?.[0] && (
                  <img src={p.imageUrls[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">Quantity: {p.quantity}</p>
                </div>
                <button
                  type="button"
                  disabled={itemBusyId === p.id}
                  onClick={() => handleRemoveItem(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="text-red-500 disabled:opacity-40"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {pack.items.length === 0 && (
              <p className="text-sm text-gray-400">No products in this pack yet.</p>
            )}
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
                readOnly
                value={marketValue}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-500 outline-none"
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
              <p className="text-lg font-bold text-primary">₦{Math.max(0, savings).toLocaleString()}</p>
            </div>
          </div>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
            {Math.max(0, savingsPct)}% OFF
          </span>
        </div>

        <button
          type="button"
          onClick={handleDelete}
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
          disabled={saving}
          onClick={handleSave}
          className="flex-1 rounded-full bg-primary py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
