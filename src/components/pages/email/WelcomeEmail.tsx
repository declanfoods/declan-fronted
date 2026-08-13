import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";

interface Props { name: string; referralCode: string }

export default function WelcomeEmail({ name, referralCode }: Props) {
  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
 <Logo className="h-17 w-12" />        </div>
        <h1 className="text-white text-2xl font-bold">Welcome to Declan Foods!</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-4">Hello {name}! 🎉</p>
        <p className="text-gray-700 mb-4">
          Welcome to Nigeria's smartest food delivery platform! We're excited to have you join our growing
          community of smart shoppers who earn while they shop.
        </p>
        <p className="text-gray-700 mb-6">
          Your account has been successfully created and you're ready to start enjoying fresh, quality groceries
          delivered to your doorstep.
        </p>

        <div className="bg-black rounded-xl text-center py-6 px-6 mb-6">
          <p className="text-white mb-2">Your Unique Referral Code</p>
          <p className="text-white text-2xl font-bold mb-2">{referralCode}</p>
          <p className="text-white text-sm">Share this code and earn ₦300 for each successful referral!</p>
        </div>

        <div className="border border-primary rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">What You Get</h3>
          <ul className="space-y-2 text-gray-800">
            <li>✅ 1.5% monthly cashback on orders above ₦15,000</li>
            <li>✅ ₦300 bonus for each successful referral</li>
            <li>✅ 3% ROI on prepaid bundles after 30 days</li>
            <li>✅ 1.5% commission on your network's orders</li>
            <li>✅ Fresh quality guaranteed on all products</li>
            <li>✅ 30-minute average delivery time</li>
          </ul>
        </div>

        <p className="text-gray-700 mb-6">
          Ready to start shopping and earning? Click the button below to explore our fresh product catalog
          and place your first order.
        </p>

        <div className="text-center mb-6">
          <a href="#" className="inline-block bg-black text-white font-semibold rounded-xl px-10 py-4">
            Start Shopping Now
          </a>
        </div>

        <div>
          <p className="text-gray-800 font-semibold mb-2">Next Steps</p>
          <ol className="list-decimal list-inside text-gray-700 space-y-1">
            <li>Browse our 100+ fresh products</li>
            <li>Place your first order (₦15,000+ to qualify for rewards)</li>
            <li>Share your referral code with friends and family</li>
            <li>Start earning while you shop</li>
          </ol>
        </div>
      </div>

     <EmailFooter email="support@declanfoods.com" />
    </div>
  );
}