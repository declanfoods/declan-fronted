import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";
interface OrderItem { name: string; qty: number; price: number }
interface Props {
  orderId: string;
  items: OrderItem[];
  orderDate: string;
  paymentMethod: string;
  deliveryAddress: string;
}

export default function OrderConfirmedEmail({ orderId, items, orderDate, paymentMethod, deliveryAddress }: Props) {
  const total = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
          <Logo className="h-17 w-12" />
        </div>
        <h1 className="text-white text-2xl font-bold">Order Confirmed!</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-2">Hello👋</p>
        <p className="text-gray-700 mb-6">
          Great news! Your order has been confirmed and is being prepared for delivery. We're excited to bring
          fresh, quality groceries right to your doorstep!
        </p>

        <div className="bg-primary/15 rounded-xl text-center py-8 px-6 mb-6">
          <div className="text-3xl mb-2">✅</div>
          <h2 className="text-primary-dark text-xl font-semibold">Order Confirmed</h2>
          <p className="text-primary-dark mb-1">Order ID: <span className="font-bold">{orderId}</span></p>
          <p className="text-primary-dark mb-4">Estimated delivery: 25-35 minutes</p>
          <a href="#" className="inline-block bg-primary text-white font-semibold rounded-xl px-8 py-3">
            Track Your Order
          </a>
        </div>

        <div className="border border-primary rounded-xl p-6 mb-6">
          <h3 className="text-primary-dark font-bold mb-2">Order Summary</h3>
          <p className="text-primary-dark mb-3">Order ID: <span className="font-bold">{orderId}</span></p>
          <hr className="border-primary/30 mb-3" />
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-primary-dark py-2 border-b border-primary/30">
              <span>{item.name} x{item.qty}</span>
              <span>₦{item.price}</span>
            </div>
          ))}
          <div className="flex justify-between text-primary-dark font-bold pt-3">
            <span>Total:</span>
            <span>₦{total}</span>
          </div>
        </div>

        <div className="bg-accent/15 rounded-xl p-6 mb-6">
          <h3 className="text-accent font-bold mb-3">Order Details</h3>
          <p className="text-accent mb-2">Order ID: <span className="font-bold">{orderId}</span></p>
          <hr className="border-accent/30 mb-2" />
          <div className="flex justify-between text-accent py-1">
            <span>Order Date</span><span className="font-bold">{orderDate}</span>
          </div>
          <div className="flex justify-between text-accent py-1">
            <span>Payment Method</span><span className="font-bold">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-accent py-1">
            <span>Delivery Address</span><span className="font-bold">{deliveryAddress}</span>
          </div>
        </div>

        <div className="bg-primary/15 rounded-xl p-6 mb-6">
          <h3 className="text-primary-dark font-bold mb-3">What Next?</h3>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            <li><strong>Order Preparation:</strong> Our team is carefully selecting and packing your fresh groceries.</li>
            <li><strong>Rider Assignment:</strong> A delivery rider will be assigned to your order shortly.</li>
            <li><strong>Real-time Tracking:</strong> Use the tracking link to monitor your delivery in real-time.</li>
            <li><strong>Enjoy Your Order:</strong> Fresh groceries delivered to your door!</li>
          </ul>
        </div>

        <p className="text-gray-700">
          Thank you for choosing Declan Foods! We're committed to delivering the freshest quality groceries
          while helping you earn rewards. If you have any questions, our support team is always here to help.
        </p>
      </div>

      <EmailFooter email="support@declanfoods.com" />
    </div>
  );
}

