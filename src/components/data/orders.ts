export type OrderStatus = 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export interface OrderItem {
  name: string;
  price: number;
}

export interface RiderOrder {
  id: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryInstructions: string;
}

export const mockOrders: RiderOrder[] = [
  {
    id: 'ORD-2026-004',
    customerName: 'John Doe',
    phone: '0808 495 2394',
    items: [
      { name: 'Fresh Tomatoes (1kg)', price: 2500 },
      { name: 'Local Rice (1kg)', price: 2500 },
      { name: 'Frozen Chicken (1kg)', price: 2500 },
    ],
    status: 'assigned',
    deliveryName: 'Favour Daniels',
    deliveryAddress: '123, Allen Avenue, Ikeja\nLagos, Nigeria',
    deliveryPhone: '+234 806 988 3528',
    deliveryInstructions: 'Please ring the doorbell.',
  },
  {
    id: 'ORD-2026-004',
    customerName: 'John Doe',
    phone: '0808 495 2394',
    items: [
      { name: 'Fresh Tomatoes (1kg)', price: 2500 },
      { name: 'Local Rice (1kg)', price: 2500 },
      { name: 'Frozen Chicken (1kg)', price: 2500 },
    ],
    status: 'picked_up',
    deliveryName: 'Favour Daniels',
    deliveryAddress: '123, Allen Avenue, Ikeja\nLagos, Nigeria',
    deliveryPhone: '+234 806 988 3528',
    deliveryInstructions: 'Please ring the doorbell.',
  },
];