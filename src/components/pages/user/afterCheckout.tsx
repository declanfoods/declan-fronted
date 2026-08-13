import Container from '../../layout/Container';
import Button from '../../ui/Button';
import { formatNaira } from '../../data/products';

const CODE = ['8', '8', '8', '8'];

type OrderItem = {
  id: string;
  date: string;
  name: string;
  price: number;
  image: string;
};

const orderItems: OrderItem[] = [
  {
    id: 'oi-1',
    date: 'Oct 24, 2025',
    name: 'Plantain · 4 fingers',
    price: 2500,
    image: 'https://picsum.photos/seed/checkout-plantain-1/200/200',
  },
  {
    id: 'oi-2',
    date: 'Oct 24, 2025',
    name: 'Plantain · 4 fingers',
    price: 2500,
    image: 'https://picsum.photos/seed/checkout-plantain-2/200/200',
  },
];

const total = orderItems.reduce((sum, item) => sum + item.price, 0);

export default function afterCheckout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-primary">
        <Container className="flex items-center justify-between py-5 text-white">
          <button
            type="button"
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl hover:bg-white/10"
          >
            ←
          </button>
          <h1 className="text-xl font-bold sm:text-2xl">Checkout Screen</h1>
          <span className="w-10" aria-hidden />
        </Container>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-2xl">
          {/* Delivery verification code */}
          <section className="rounded-3xl border-2 border-primary bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-center text-sm font-bold uppercase tracking-widest text-primary">
              Delivery Verification
            </h2>

            <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
              {CODE.map((digit, i) => (
                <div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-primary bg-primary text-3xl font-extrabold text-white sm:h-20 sm:w-20 sm:text-4xl"
                >
                  {digit}
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-base text-ink-soft">
              Give this code to the rider upon delivery
            </p>
          </section>

          {/* Rider status */}
          <section className="mt-6 rounded-3xl border-2 border-accent bg-accent/10 p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>
                <span className="inline-block h-2 w-2 rounded-full bg-accent" /> Rider is 5
                mins away
              </span>
              <span>Arriving at 12:54 PM</span>
            </div>
          </section>

          {/* Map area (placeholder) */}
          <section className="mt-6 overflow-hidden rounded-3xl border-2 border-primary bg-muted">
            <div className="relative flex h-64 items-center justify-center bg-ink/5 sm:h-80">
              <img
                src="https://picsum.photos/seed/declan-map/1200/700"
                alt="Delivery map"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border-2 border-primary bg-white p-4 shadow-md">
                <img
                  src="https://picsum.photos/seed/rider-avatar/120/120"
                  alt="Rider avatar"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="text-lg font-bold text-ink">John Smith</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-ink-soft">
                    <span className="text-accent" aria-hidden>★</span>
                    <span className="font-semibold text-ink">4.9</span>
                    <span>Rating</span>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Call rider"
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary text-xl text-white hover:bg-primary-dark"
                >
                  📞
                </button>
              </div>
            </div>
          </section>

          {/* Saved Address */}
          <section className="mt-6 rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-primary">
                <span aria-hidden>📍</span> Saved Address
              </h3>
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="mt-3 rounded-2xl bg-primary/15 p-5">
              <p className="text-lg font-bold text-ink">Campus Hub</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                East Hall, Room 402, Central University Campus
              </p>
            </div>
          </section>

          {/* Order Summary */}
          <section className="mt-6 rounded-3xl border-2 border-primary bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-ink">Order Summary</h3>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                #DF-2984
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-4">
              {orderItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 border-b border-muted/60 pb-4 last:border-0 last:pb-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-ink-soft">{item.date}</p>
                    <p className="text-base font-semibold text-ink">{item.name}</p>
                  </div>
                  <p className="text-lg font-bold text-ink">{formatNaira(item.price)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-muted/60 pt-5">
              <span className="text-lg font-semibold text-ink">Total with Delivery</span>
              <span className="text-xl font-extrabold text-ink">{formatNaira(total)}</span>
            </div>
          </section>

          {/* Confirm button */}
          <div className="mt-8">
            <Button size="lg" className="w-full">
              Confirm Successful Delivery
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
