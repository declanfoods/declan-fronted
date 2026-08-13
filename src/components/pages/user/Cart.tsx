import { useState } from 'react';
import Container from '../../layout/Container';
import Button from '../../ui/Button';
import { formatNaira } from '../../data/products';

type CartItem = {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  qty: number;
  image: string;
};

const initialItems: CartItem[] = [
  { id: 'ci-1', name: 'Fresh Fish (Whole)', category: 'Protein', unitPrice: 3500, qty: 1, image: 'https://picsum.photos/seed/cart-fish/300/300' },
  { id: 'ci-2', name: 'Plantain (4 Fingers)', category: 'Quick Meals', unitPrice: 2500, qty: 1, image: 'https://picsum.photos/seed/cart-plantain/300/300' },
  { id: 'ci-3', name: 'Dry Fish (5 pieces)', category: 'Protein', unitPrice: 1500, qty: 2, image: 'https://picsum.photos/seed/cart-dryfish/300/300' },
  { id: 'ci-4', name: 'Crayfish (1kg)', category: 'Spices&Flavor', unitPrice: 2500, qty: 2, image: 'https://picsum.photos/seed/cart-crayfish/300/300' },
];

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [promo, setPromo] = useState('');

  const updateQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item,
      ),
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const totalSavings = 0;
  const deliveryFee = 0;
  const total = subtotal - totalSavings + deliveryFee;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <Container className="flex items-center justify-between py-6">
        <a href="/" className="text-2xl font-extrabold text-primary tracking-tight">
          Declan<span className="text-accent">Foods</span>
        </a>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
          Shopping Cart <span aria-hidden>🛒</span>
        </h1>
        <a
          href="/app/profile"
          className="hidden items-center gap-2 text-lg font-semibold text-primary hover:underline sm:inline-flex"
        >
          <span aria-hidden>👤</span> Profile
        </a>
      </Container>

      {/* Progress + Continue Shopping */}
      <Container className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <ol className="flex items-center gap-0">
          {[1, 2, 3].map((step, i) => (
            <li key={step} className="flex items-center">
              <span
                className={
                  'flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl font-bold ' +
                  (step === 1
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary bg-white text-primary')
                }
              >
                {step}
              </span>
              {i < 2 && (
                <span className="mx-2 h-0.5 w-24 border-t-2 border-primary sm:w-32" />
              )}
            </li>
          ))}
        </ol>
        <Button as="a" href="/products" size="md">
          Continue Shopping
        </Button>
      </Container>

      <Container className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* LEFT: cart items */}
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex items-start gap-4 rounded-3xl border-2 border-primary bg-white p-4 sm:p-5"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-28 w-28 flex-shrink-0 rounded-2xl object-cover sm:h-32 sm:w-32"
              />
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">{item.name}</h3>
                    <span className="mt-1 inline-flex rounded-full bg-muted/70 px-3 py-1 text-xs font-medium text-ink-soft">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xl text-primary">
                    <button
                      type="button"
                      aria-label="Save for later"
                      className="hover:text-accent"
                    >
                      ♡
                    </button>
                    <button
                      type="button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.id)}
                      className="hover:text-accent"
                    >
                      🗑
                    </button>
                  </div>
                </div>

                <p className="text-xl font-bold text-ink">{formatNaira(item.unitPrice)}</p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, -1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-lg font-bold text-white"
                      aria-label="Decrease quantity"
                    >
                      +
                    </button>
                    <span className="min-w-[1.5rem] text-center text-lg font-semibold text-ink">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-lg font-bold text-white"
                      aria-label="Increase quantity"
                    >
                      −
                    </button>
                  </div>
                  <p className="text-xl font-extrabold text-primary">
                    {formatNaira(item.unitPrice * item.qty)}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {items.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-primary bg-white p-16 text-center">
              <p className="text-lg font-semibold text-ink">Your cart is empty</p>
              <p className="mt-2 text-sm text-ink-soft">
                Add some products to get started.
              </p>
            </div>
          )}

          {/* Promo Code */}
          <div className="mt-4 rounded-3xl bg-primary p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white">
              <span aria-hidden>💎</span> Promo Code
            </h3>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Enter promo code"
                className="flex-1 rounded-full border-0 bg-white px-6 py-4 text-base text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-white/60"
              />
              <button
                type="button"
                className="rounded-full bg-white px-8 py-4 text-lg font-bold text-primary transition-colors hover:bg-white/90"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: summary + delivery */}
        <div className="flex flex-col gap-6">
          {/* Order Summary */}
          <div className="rounded-3xl border-2 border-primary bg-white p-6">
            <h3 className="text-2xl font-bold text-ink">Order Summary</h3>

            <dl className="mt-6 flex flex-col gap-4 text-lg">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-ink">Sub-total ({items.length} items)</dt>
                <dd className="font-bold text-ink">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-ink">Total Savings</dt>
                <dd className="font-bold text-ink">{formatNaira(totalSavings)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-ink">Delivery Fee</dt>
                <dd className="font-bold text-primary">FREE</dd>
              </div>
              <div className="border-t border-muted pt-4" />
              <div className="flex items-center justify-between">
                <dt className="text-xl font-bold text-ink">Total</dt>
                <dd className="text-xl font-extrabold text-ink">{formatNaira(total)}</dd>
              </div>
            </dl>

            <Button size="lg" className="mt-6 w-full">
              Proceed to Checkout
            </Button>

            <p className="mt-4 text-center text-sm text-ink-soft">
              Estimated delivery: 25-35 minutes
            </p>
          </div>

          {/* Delivery Details */}
          <div className="rounded-3xl border-2 border-primary bg-white p-6">
            <h3 className="text-2xl font-bold text-primary">
              <span aria-hidden>📍</span> Delivery Details
            </h3>
            <div className="mt-4 space-y-2 text-lg text-ink">
              <p className="font-semibold">Favour Daniels</p>
              <p>123, Allen Avenue, Ikeja</p>
              <p>Lagos, Nigeria</p>
            </div>
            <Button size="lg" className="mt-6 w-full">
              Change Address
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
