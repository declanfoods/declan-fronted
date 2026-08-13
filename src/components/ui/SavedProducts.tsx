import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader2 } from 'lucide-react';
import AppLayout from '../app/AppLayout';
import SplashLoader from './SplashLoader';
import ProductCard from './ProductCard';
import { savedApi, type SavedProduct } from '../../app/lib/savedApi';

export default function SavedProducts() {
  const navigate = useNavigate();
  const [savedItems, setSavedItems] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSaved = async () => {
    try {
      const res = await savedApi.getSavedProducts();
      setSavedItems(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load saved products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (savedItemId: string) => {
    setRemovingId(savedItemId);
    try {
      await savedApi.removeSavedProduct(savedItemId);
      setSavedItems((prev) => prev.filter((item) => item.id !== savedItemId));
    } catch {} finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Saved Products">
        <SplashLoader />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Saved Products">
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
    <AppLayout title="Saved Products">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-ink">Saved Products</h2>
          <p className="text-sm text-ink-soft">
            Your wishlist — {savedItems.length}{' '}
            {savedItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {savedItems.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-5xl">❤️</p>
            <p className="mt-4 text-lg font-semibold text-ink-soft">No saved products yet</p>
            <button
              onClick={() => navigate('/app/shop')}
              className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedItems.map((item) => (
              <div key={item.id} className="relative">
                <ProductCard product={item.product} />
                <button
                  type="button"
                  disabled={removingId === item.id}
                  onClick={() => handleRemove(item.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition-colors hover:bg-red-50 disabled:opacity-60"
                  aria-label="Remove from saved"
                >
                  {removingId === item.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}