import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";

interface Props {
  code: string;
  orderId: string;
  items: { name: string; qty: number; price: number }[];
}

export default function VerifyOrderEmail({ code, orderId, items }: Props) {
  const total = items.reduce((s, i) => s + i.price, 0);
  const codeFormatted = `${code.slice(0, 3)} ${code.slice(3)}`;

  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
       <Logo className="h-17 w-12" />
        </div>
        <h1 className="text-white text-2xl font-bold">Verify Your Order</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-2">Hello👋</p>
        <p className="text-gray-700 mb-6">
          Thank you for placing an order with Declan Foods! To confirm your order and proceed with delivery,
          please verify your email address using the verification code below.
        </p>

        <div className="bg-primary/15 rounded-xl text-center py-8 px-6 mb-4">
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="text-primary-dark text-xl font-semibold">Your Verification Code</h2>
          <p className="text-primary-dark text-sm mb-2">Enter this code to confirm your order</p>
          <p className="text-primary-dark text-4xl font-bold tracking-widest">{codeFormatted}</p>
        </div>

        <div className="bg-accent/15 rounded-xl text-center py-3 px-6 mb-6">
          <span className="text-accent">⏱ This verification code will expire in 24 hours</span>
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

        <div className="bg-primary/15 rounded-xl p-6 mb-6">
          <h3 className="text-primary-dark font-bold mb-2">What Next?</h3>
        </div>

        <p className="text-gray-800 font-semibold mb-1">Didn't place this order?</p>
        <p className="text-gray-700">
          If you didn't make this order, you can safely ignore this email. The order will not be processed
          without verification. Once you verify your order, we'll get started on preparing your fresh groceries
          for delivery.
        </p>
      </div>

     <EmailFooter email="support@declanfoods.com" />
    </div>
  );
}

