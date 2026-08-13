export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
};

export const dealsProducts: Product[] = [
  {
    id: 1,
    name: "Plantain (4 Fingers)",
    category: "Quick Meals",
    price: 2500,
    rating: 4.9,
    reviews: 301,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
  },
  {
    id: 2,
    name: "Plantain (4 Fingers)",
    category: "Quick Meals",
    price: 2500,
    rating: 4.9,
    reviews: 301,
    image:
      "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&q=80",
  },
  {
    id: 3,
    name: "Plantain (4 Fingers)",
    category: "Quick Meals",
    price: 2500,
    rating: 4.9,
    reviews: 301,
    image:
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80",
  },
  {
    id: 4,
    name: "Plantain (4 Fingers)",
    category: "Quick Meals",
    price: 2500,
    rating: 4.9,
    reviews: 301,
    image:
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80",
  },
];

export const hottestProducts = [...dealsProducts];
export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}
