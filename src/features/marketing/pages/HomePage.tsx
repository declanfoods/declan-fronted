import Button from '../../../shared/ui/Button';
import CTABanner from '../components/CTABanner';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ProductShelf from '../components/ProductShelf';
import RewardsSection from '../components/RewardsSection';
import { useLandingProducts } from '../queries';

export default function HomePage() {
  const { deals, hottest } = useLandingProducts();

  return (
    <>
      <Hero />
      <ProductShelf
        id="deals"
        title="Deals of the day!"
        products={deals.data ?? []}
        loading={deals.isPending}
        failed={deals.isError}
        retry={() => deals.refetch()}
        errorMessage="Could not load deals."
        emptyMessage="No deals available right now."
      />
      <ProductShelf
        title="Browse our hottest"
        products={hottest.data ?? []}
        loading={hottest.isPending}
        failed={hottest.isError}
        retry={() => hottest.refetch()}
        errorMessage="Could not load products."
        emptyMessage="No products available right now."
      >
        <div className="mt-8 flex justify-center">
          <Button as="a" href="/app/shop" size="lg">
            View all Products
          </Button>
        </div>
      </ProductShelf>
      <RewardsSection />
      <HowItWorks />
      <CTABanner />
    </>
  );
}
