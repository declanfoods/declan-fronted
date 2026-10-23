import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Loader2,
  ChevronLeft,
  Package,
  Tag,
  CreditCard,
  ImageOff,
  AlertCircle,
  ChevronRight,
  ZoomIn,
  X,
} from 'lucide-react';
import { foodpackApi } from '../../../../app/lib/foodpackApi';
import type { ApiFoodpack } from '../../../../app/lib/foodpackApi';
import { cartApi } from '../../../../app/lib/cartApi';
import { guestCart } from '../../../../app/lib/guestCart';
import { isAuthenticated } from '../../../../app/lib/auth';
import { formatNaira } from '../../../data/products';


export default function CustomerFoodPackDetailPage() {
  const { foodpackId } = useParams<{ foodpackId: string }>();
  const navigate = useNavigate();
 
  const [pack, setPack] = useState<ApiFoodpack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
 
  useEffect(() => {
    if (!foodpackId) return;
    setLoading(true);
    setError(null);
 
    foodpackApi
      .getFoodpackById(foodpackId)
      .then((res) => {
        // res may be the raw Axios response (res.data = ApiResponse)
        // or already unwrapped by an interceptor (res = ApiResponse)
        // Handle both shapes:
        const payload = (res as any).data ?? res;
        const foodpack: ApiFoodpack =
          payload?.data?.foodpack ?? payload?.foodpack ?? null;
 
        if (foodpack) {
          setPack(foodpack);
        } else {
          setError('Food pack not found.');
        }
      })
      .catch((err) => {
        console.error('getFoodpackById error:', err);
        setError('Could not load this food pack. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [foodpackId]);
 
  const handleAddToCart = async () => {
    if (!pack) return;
    setAdding(true);
    try {
      const price = Number(pack.price);
      if (isAuthenticated()) {
        await cartApi.addItem({ foodpackId: pack.id, quantity: 1 });
      } else {
        guestCart.addItem({
          id: pack.id,
          itemName: pack.name,
          itemCategoryName: 'Food Pack',
          itemId: pack.id,
          acceptPaymentOnDelivery: pack.acceptPaymentOnDelivery,
          itemType: 'FOODPACK',
          itemUrls: pack.imageUrls ?? [],
          itemPrice: String(price),
        });
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setAdding(false);
    }
  };
 
  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm text-ink-soft">Loading food pack…</p>
      </div>
    );
  }
 
  // ── Error state ──
  if (error || !pack) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <AlertCircle size={40} className="text-red-400" />
        <p className="text-sm font-medium text-ink">{error ?? 'Food pack not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }
 
  const price = Number(pack.price);
  const hasDiscount = pack.amountOff > 0;
  const images = pack.imageUrls ?? [];
  const items = pack.items ?? [];
 
  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-muted bg-white/90 px-4 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-ink-soft transition-colors hover:bg-gray-200"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="line-clamp-1 text-sm font-semibold text-ink">{pack.name}</span>
      </div>
 
      <div className="mx-auto max-w-2xl px-4 pt-5">
        {/* ── Image gallery ── */}
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-gray-100">
          {images.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative block w-full"
              >
                <img
                  src={images[activeImage]}
                  alt={pack.name}
                  className="h-64 w-full object-cover sm:h-80"
                />
                {/* Zoom hint overlay */}
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ZoomIn size={13} />
                  View
                </span>
              </button>
              {hasDiscount && (
                <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow">
                  {pack.amounOffInPercent}% OFF
                </span>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={
                        'h-2 rounded-full transition-all ' +
                        (i === activeImage ? 'w-5 bg-white' : 'w-2 bg-white/50')
                      }
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center gap-2 text-gray-300 sm:h-80">
              <ImageOff size={40} />
              <span className="text-sm">No image available</span>
            </div>
          )}
        </div>
 
        {/* Thumbnail row */}
        {images.length > 1 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={
                  'h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ' +
                  (i === activeImage
                    ? 'border-primary'
                    : 'border-transparent opacity-60 hover:opacity-90')
                }
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
 
        {/* ── Pack header ── */}
        <div className="mb-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              <Package size={11} />
              {pack.category?.name ?? 'Food Pack'}
            </span>
 
            {pack.acceptPaymentOnDelivery === false && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                <CreditCard size={11} />
                Pay before delivery
              </span>
            )}
          </div>
 
          <h1 className="text-xl font-bold capitalize leading-snug text-ink sm:text-2xl">
            {pack.name}
          </h1>
 
          {pack.description && (
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pack.description}</p>
          )}
        </div>
 
        {/* ── Price block ── */}
        <div className="mb-6 flex flex-wrap items-end gap-3">
          <span className="text-2xl font-bold text-ink">{formatNaira(price)}</span>
          {hasDiscount && (
            <>
              <span className="mb-0.5 text-sm text-ink-soft line-through">
                {formatNaira(pack.originalPrice)}
              </span>
              <span className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                <Tag size={11} />
                Save {formatNaira(pack.amountOff)}
              </span>
            </>
          )}
        </div>
 
        {/* ── Items in this pack ── */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-ink-soft">
            What's inside{' '}
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
 
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted py-8 text-center text-sm text-ink-soft">
              No items listed for this pack.
            </div>
          ) : (
            <ul className="divide-y divide-muted overflow-hidden rounded-2xl border border-muted bg-white">
              {items.map((item, index) => {
                const thumb = item.itemImageUrls?.[0];
                return (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
 
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={item.name}
                        className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
                        🥦
                      </div>
                    )}
 
                    <span className="flex-1 text-sm font-semibold capitalize text-ink">
                      {item.name}
                    </span>
 
                    <span className="flex-shrink-0 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      ×{item.quantityOfProductInPack}{' '}
                      <span className="font-normal text-ink-soft">{item.quantityUnit}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
 
        {/* ── Dates ── */}
        {(pack.createdAt || pack.updatedAt) && (
          <div className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
            {pack.createdAt && (
              <span>
                Listed{' '}
                {new Date(pack.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
            {pack.updatedAt && pack.updatedAt !== pack.createdAt && (
              <span>
                Updated{' '}
                {new Date(pack.updatedAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        )}
      </div>
 
      {/* ── Lightbox ── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X size={20} />
          </button>
 
          {/* Image counter */}
          {images.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {activeImage + 1} / {images.length}
            </span>
          )}
 
          {/* Prev arrow */}
          {images.length > 1 && activeImage > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveImage(activeImage - 1); }}
              className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>
          )}
 
          {/* Next arrow */}
          {images.length > 1 && activeImage < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveImage(activeImage + 1); }}
              className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          )}
 
          {/* Full image — stop propagation so clicking the image itself doesn't close */}
          <img
            src={images[activeImage]}
            alt={pack.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
 
          {/* Dot strip */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                  className={
                    'h-1.5 rounded-full transition-all ' +
                    (i === activeImage ? 'w-5 bg-white' : 'w-1.5 bg-white/40')
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
 
      {/* ── Sticky bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-muted bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-ink-soft">Total price</p>
            <p className="text-base font-bold text-ink">{formatNaira(price)}</p>
          </div>
          <button
            type="button"
            disabled={adding}
            onClick={handleAddToCart}
            className={
              'flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-8 ' +
              (added
                ? 'bg-green-500 text-white'
                : 'bg-primary text-white hover:bg-primary-dark disabled:opacity-60')
            }
          >
            {adding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} strokeWidth={2} />
            )}
            {adding ? 'Adding…' : added ? 'Added to Cart ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
 
