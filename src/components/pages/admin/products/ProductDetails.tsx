import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Pencil, EyeOff, Eye } from 'lucide-react';
import { adminProductApi, type AdminProduct } from '../../../../app/lib/adminProductApi';

function formatPrice(price: string) {
  const num = Number(price);
  return Number.isNaN(num) ? price : `₦${num.toLocaleString()}`;
}

export default function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProduct = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminProductApi.getProductById(id);
      setProduct(res.data.data.product);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleHide = async () => {
    if (!id || !product) return;
    setActionLoading(true);
    try {
      if (product.isHidden) {
        await adminProductApi.unhideProduct(id);
      } else {
        await adminProductApi.hideProduct(id);
      }
      fetchProduct();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update visibility.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5">
        <p className="text-sm text-red-500">{error || 'Product not found.'}</p>
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
    <div className="flex min-h-screen flex-col bg-white pb-10">
      <header className="flex items-center justify-between px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="text-primary-dark">
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-bold text-primary-dark">Product Details</h1>
        <button type="button" className="text-primary-dark">
          <ShoppingCart size={20} strokeWidth={2} />
        </button>
      </header>

      <div className="relative h-56 w-full bg-gray-100">
        {product.imageUrls?.[0] && (
          <img src={product.imageUrls[0]} alt={product.name} className="h-full w-full object-cover" />
        )}
        {product.imageUrls && product.imageUrls.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {product.imageUrls.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 space-y-5 px-5 pt-5">
        <div>
          <span className="inline-block rounded-full bg-[#F3F7EE] px-3 py-1 text-xs font-semibold text-primary-dark">
            {product.category?.name}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-gray-900">{product.name}</h2>
          <p className="mt-2 text-sm text-gray-500">{product.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-400">Price</p>
            <p className="mt-1 text-lg font-extrabold text-primary">{formatPrice(product.price)}</p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-400">SKU</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">{product.sku}</p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-400">Inventory</p>
            <p className="mt-1 flex items-center gap-1.5 text-lg font-extrabold text-gray-900">
              {product.quantity} units{' '}
              <span
                className={`h-2 w-2 rounded-full ${
                  product.quantity > 0 ? 'bg-primary' : 'bg-red-500'
                }`}
              />
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F7EE] p-4">
            <p className="text-xs text-gray-400">Unit</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">{product.scale}</p>
          </div>
        </div>

        <section>
          <h3 className="mb-3 text-base font-bold text-gray-900">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Orders</p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">
                {product.total_orders ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 p-4">
              <p className="text-xs text-gray-400">Status</p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">
                {product.isHidden ? 'Hidden' : 'Visible'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 p-4">
            <div>
              <p className="text-xs text-gray-500">Revenue</p>
              <p className="text-xl font-extrabold text-primary">
                ₦{(product.total_revenue ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-base font-bold text-gray-900">Admin Controls</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/products/${id}/edit`)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white"
            >
              <Pencil size={16} />
              Edit Product
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleToggleHide}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 py-3.5 text-sm font-semibold text-gray-600 disabled:opacity-60"
            >
              {product.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
              {product.isHidden ? 'Unhide' : 'Hide'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}