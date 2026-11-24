import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Heart, Loader2, Star } from 'lucide-react';
import SplashLoader from '../../../shared/ui/SplashLoader';
import ProductCard from '../components/ProductCard';
import { formatNaira } from '../../../shared/formatters/formatNaira';
import { productApi } from '../api/productApi';
import { getEffectivePrice } from '../pricing';
import { addProductToCart } from '../../cart/cartActions';
import { useSavedProducts, useSaveProduct } from '../saved/queries';
import { getApiErrorMessage } from '../../../app/lib/api-types';
import { isAuthenticated } from '../../auth/session';

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return <ProductDetails key={id} id={id ?? ''} />;
}

function ProductDetails({ id }: { id: string }) {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const productQuery = useQuery({
    queryKey: ['catalogue', 'products', id],
    enabled: Boolean(id),
    retry: false,
    queryFn: async ({ signal }) => {
      try {
        const { data } = await productApi.getProductById(id, signal);
        if (data.success === false) throw new Error(data.message || 'Could not load the product.');
        return data.data?.product ?? null;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
  });
  const product = productQuery.data;

  const relatedQuery = useQuery({
    queryKey: ['customer', 'catalogue', 'related-products', id],
    enabled: authenticated && Boolean(product),
    retry: false,
    queryFn: async ({ signal }) => {
      const { data } = await productApi.getRelatedProducts(id, signal);
      return data.data?.products ?? [];
    },
  });
  const related = authenticated ? relatedQuery.data ?? [] : [];

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');

  const savedProducts = useSavedProducts();
  const saveProduct = useSaveProduct();
  const saving = saveProduct.isPending;
  const saved = savedProducts.data?.some((item) => item.product.id === id) ||
    (saveProduct.isSuccess && saveProduct.variables === id);
  const saveError = saveProduct.isError && saveProduct.variables === id
    ? getApiErrorMessage(saveProduct.error, 'Could not save the product.')
    : '';

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStar, setReviewStar] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    setAddedMsg('');
    try {
      await addProductToCart(product, qty);
      setAddedMsg('Added to cart!');
      setTimeout(() => setAddedMsg(''), 2000);
    } catch (err: any) {
      setAddedMsg(err.response?.data?.message ?? 'Failed to add.');
    } finally {
      setAdding(false);
    }
  };

  const handleSave = () => {
    if (!product || saving || saved) return;
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    saveProduct.mutate(product.id);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setReviewLoading(true);
    setReviewMsg('');
    try {
      await productApi.reviewProduct(product.id, {
        star: reviewStar,
        comment: reviewComment,
      });
      setReviewMsg('Review submitted!');
      setShowReviewForm(false);
      setReviewComment('');
    } catch (err: any) {
      setReviewMsg(err.response?.data?.message ?? 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (id && productQuery.isPending) {
    return <SplashLoader />;
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-ink">
          {productQuery.isError
            ? getApiErrorMessage(productQuery.error, 'Could not load the product.')
            : 'Product not found'}
        </p>
        {productQuery.isError && (
          <button
            type="button"
            onClick={() => void productQuery.refetch()}
            className="text-sm font-semibold text-primary underline"
          >
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/app/shop')}
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const image = product.imageUrls?.[0] ?? '';
  return (
    <div className="min-h-screen bg-white">
      {/* Header + image */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-primary px-4 py-4">
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="text-white">
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <h1 className="text-base font-semibold text-white">Product Details</h1>
          <button
            type="button"
            onClick={() => navigate('/app/cart')}
            aria-label="Cart"
            className="relative text-white"
          >
            <ShoppingCart size={24} strokeWidth={2} />
          </button>
        </div>
        {image ? (
          <img src={image} alt={product.name} className="h-64 w-full object-cover" />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-5xl">
            🛒
          </div>
        )}
      </div>

      <div className="px-5 py-5">
        {/* Title + save */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-ink">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {product.category?.name ?? 'Product'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || saved || (isAuthenticated() && savedProducts.isPending)}
            aria-label={saved ? 'Product saved' : 'Save product'}
            className="ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {saveError && <p role="alert" className="mt-2 text-sm text-red-600">{saveError}</p>}

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
          <span className="text-accent">★</span>
          <span className="font-semibold">{product.rating ?? 0}</span>
          <span className="text-gray-400">({product.reviewCount ?? 0} reviews)</span>
        </div>

        {/*
          product.price is the PRE-discount price. This page quoted 70 for an
          item the customer pays 50, and the discount the API sends was never
          drawn.
        */}
{(() => {
  const pricing = getEffectivePrice(product);
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="text-2xl font-bold text-primary">
        {formatNaira(pricing.price)}
      </p>

      {pricing.isDiscounted && (
        <>
          <p className="text-base font-medium text-gray-400 line-through">
            {formatNaira(pricing.originalPrice)}
          </p>
          {pricing.percentOff > 0 && (
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
              {pricing.percentOff}% OFF
            </span>
          )}
          <p className="w-full text-xs font-semibold text-accent">
            You save {formatNaira(pricing.discountAmount)}
          </p>
        </>
      )}
    </div>
  );
})()}
        {/* Description */}
        {product.description && (
          <>
            <h3 className="mt-5 text-lg font-bold text-ink">Description</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          </>
        )}

        {/* Review section */}
        <div className="mt-6">
          {!showReviewForm ? (
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleReview} className="rounded-2xl border border-muted bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-ink">Write a Review</p>

              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewStar(s)}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      fill={s <= reviewStar ? '#f59e0b' : 'none'}
                      stroke={s <= reviewStar ? '#f59e0b' : '#d1d5db'}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us what you think..."
                rows={3}
                className="mt-3 w-full rounded-xl border border-muted p-3 text-sm text-ink outline-none focus:border-primary"
                required
              />

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-sm font-semibold text-ink-soft hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {reviewMsg && (
            <p className="mt-2 text-sm font-medium text-primary">{reviewMsg}</p>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 text-lg font-bold text-ink">Related Products</h3>
            <div className="grid grid-cols-2 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 border-t border-muted bg-white px-5 py-4">
        {addedMsg && (
          <p className="mb-2 text-center text-sm font-medium text-primary">{addedMsg}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-full border border-primary px-3 py-2">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="text-primary"
            >
              <Minus size={18} strokeWidth={2} />
            </button>
            <span className="w-4 text-center font-semibold text-ink">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="text-primary"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            disabled={adding}
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {adding ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ShoppingCart size={18} strokeWidth={2} />
            )}
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
