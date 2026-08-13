import type { ApiProduct } from '../../app/lib/productApi';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ApiProduct[];
  className?: string;
  onCartUpdate?: () => void;
}

export default function ProductGrid({ products, className, onCartUpdate }: ProductGridProps) {
  return (
    <div
      className={
        'grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 ' + (className ?? '')
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onCartUpdate={onCartUpdate} />
      ))}
    </div>
  );
}