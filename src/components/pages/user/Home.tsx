

import { useState, useEffect } from 'react';
import Container from '../../layout/Container';
import Section from '../../layout/Section';
import SectionHeading from '../../ui/SectionHeading';
import ProductCard from '../../ui/ProductCard';
import Button from '../../ui/Button';
import Hero from '../../landing/Hero';
import RewardsSection from '../../landing/RewardsSection';
import HowItWorks from '../../landing/HowItWorks';
import CTABanner from '../../landing/CTABanner';
import { productApi, type ApiProduct } from '../../../app/lib/productApi';
import { isAuthenticated } from '../../../app/lib/auth';

export default function Home() {
  const [essentials, setEssentials] = useState<ApiProduct[]>([]);
  const [hottest, setHottest] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      /*
        ⚠️ `/products/essentials` REQUIRES A TOKEN. This landing page does not.

        Calling it for a signed-out visitor only ever produced a 401 — and the
        axios interceptor used to respond to that by redirecting to /login, so
        opening `/` as a guest bounced you off the page. The interceptor is
        fixed, but the honest fix is not to make an authenticated call with no
        credentials in the first place.

        Signed in  → essentials, as before.
        Guest      → the public catalogue, which is what "Deals of the Day"
                   can actually show. Prices and discounts come through the
                   same way; the only difference is the ordering the backend
                   applies.
      */
      const signedIn = isAuthenticated();

      try {
        const [essRes, hotRes] = await Promise.allSettled([
          signedIn
            ? productApi.getEssentials()
            : productApi.getProducts({ limit: 8 }),
          productApi.getProducts({ sortBy: 'rating', sortOrder: 'desc', limit: 8 }),
        ]);
        if (essRes.status === 'fulfilled')
          setEssentials(essRes.value.data.data.products);
        if (hotRes.status === 'fulfilled')
          setHottest(hotRes.value.data.data.products);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Hero />

      {/* Deals of the Day — Horizontal Scroll */}
      <Section>
        <Container>
          <SectionHeading className="mb-6">DEALS OF THE DAY!</SectionHeading>
          {loading ? (
            <p className="py-12 text-center text-sm font-medium text-primary animate-pulse">
              Loading products...
            </p>
          ) : essentials.length > 0 ? (
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {essentials.map((product) => (
                  <div
                    key={product.id}
                    className="w-[260px] flex-shrink-0 snap-start sm:w-[280px]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-soft">
              No deals available right now.
            </p>
          )}
        </Container>
      </Section>

      {/* Browse Our Hottest — Horizontal Scroll */}
      <Section>
        <Container>
          <SectionHeading className="mb-6">BROWSE OUR HOTTEST</SectionHeading>
          {loading ? (
            <p className="py-12 text-center text-sm font-medium text-primary animate-pulse">
              Loading products...
            </p>
          ) : hottest.length > 0 ? (
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {hottest.map((product) => (
                  <div
                    key={product.id}
                    className="w-[260px] flex-shrink-0 snap-start sm:w-[280px]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-ink-soft">
              No products available right now.
            </p>
          )}
          <div className="mt-8 flex justify-center">
            <Button as="a" href="/app/shop" size="lg">
              View all Products
            </Button>
          </div>
        </Container>
      </Section>

      <RewardsSection />
      <HowItWorks />
      <CTABanner />
    </>
  );
}