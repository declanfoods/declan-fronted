import type { PropsWithChildren } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ApiProduct } from '../../catalogue/api/productApi';
import ProductCard from '../../catalogue/components/ProductCard';
import Container from '../../../shared/ui/Container';
import Section from './Section';
import SectionHeading from './SectionHeading';

type ProductShelfProps = PropsWithChildren<{
  id?: string;
  title: string;
  products: ApiProduct[];
  loading: boolean;
  failed: boolean;
  emptyMessage: string;
  errorMessage: string;
  retry: () => void;
}>;

export default function ProductShelf({
  id,
  title,
  products,
  loading,
  failed,
  emptyMessage,
  errorMessage,
  retry,
  children,
}: ProductShelfProps) {
  return (
    <Section id={id} className="scroll-mt-6 lg:py-14">
      <Container>
        <div className="mb-6 lg:mb-7 lg:flex lg:items-end lg:justify-between lg:gap-6">
          <SectionHeading className="uppercase lg:mx-0 lg:text-left lg:text-[2.5rem] lg:normal-case">
            {title}
          </SectionHeading>
          <Link
            to="/app/shop"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-[#ccd9cc] px-5 py-3 text-sm font-semibold text-[#245b38] hover:bg-[#f3f5eb] lg:inline-flex"
          >
            View all products <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
        {loading && (
          <p className="animate-pulse py-12 text-center text-sm font-medium text-primary">
            Loading products...
          </p>
        )}
        {failed && (
          <div role="status" className="py-6 text-center text-sm text-ink-soft">
            {errorMessage}{' '}
            <button type="button" onClick={retry} className="font-semibold text-primary underline">
              Try again
            </button>
          </div>
        )}
        {products.length > 0 && (
          <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pb-0">
              {products.map((product) => (
                <div key={product.id} className="w-[260px] flex-shrink-0 snap-start sm:w-[280px] lg:w-auto lg:min-w-0 lg:[&>a]:h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !failed && products.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-soft">{emptyMessage}</p>
        )}
        {children && <div className="lg:hidden">{children}</div>}
      </Container>
    </Section>
  );
}
