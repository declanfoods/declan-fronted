import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";

interface Props { name: string; verifyUrl: string; sentTo: string }

export default function VerifyEmail({ name, verifyUrl }: Props) {
  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
 <Logo className="h-17 w-12" />        </div>
        <h1 className="text-white text-2xl font-bold">Verify Your Email</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-4">Hello {name}!👋</p>
        <p className="text-gray-700 mb-4">
          Welcome to Declan Foods! We're excited to have you join our community of smart shoppers who earn
          while they shop.
        </p>
        <p className="text-gray-700 mb-6">
          To complete your account setup and start enjoying fresh groceries with amazing rewards, please verify
          your email address by clicking the button below.
        </p>

        <div className="bg-primary rounded-xl text-center py-8 px-6 mb-6">
          <div className="text-3xl mb-2">✉️</div>
          <p className="text-white font-semibold mb-1">Verify Your Email Address</p>
          <p className="text-white text-sm mb-4">Click the button below to confirm your email address</p>
          <a href={verifyUrl} className="inline-block bg-white text-primary-dark font-semibold rounded-xl px-6 py-3">
            Verify Email Address
          </a>
        </div>

        <div className="bg-accent/15 rounded-xl text-center py-3 px-6 mb-6">
          <span className="text-accent">⏱ This verification link will expire in 24 hours</span>
        </div>

        <p className="text-gray-700 mb-3">If the link above doesn't work, you can copy and paste the following link into your browser:</p>
        <div className="bg-gray-200 rounded-xl text-center py-4 px-6 mb-6">
          <p className="text-gray-800 font-semibold mb-1">Verification Link:</p>
          <p className="text-gray-800 break-all">{verifyUrl}</p>
        </div>

        <p className="font-semibold text-gray-900 mb-1">Why verify your email?</p>
        <p className="text-gray-700 mb-6">
          Email verification helps us keep your account secure and ensures you receive important updates about
          your orders.
        </p>

        <div className="border border-primary rounded-xl p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">What's waiting for you after verification</h3>
          <ul className="space-y-2 text-gray-800">
            <li>✅ 1.5% monthly cashback on orders above ₦15,000</li>
            <li>✅ ₦300 bonus for each successful referral</li>
            <li>✅ 3% ROI on prepaid bundles after 30 days</li>
            <li>✅ 1.5% commission on your network's orders</li>
            <li>✅ Fresh quality guaranteed on all products</li>
            <li>✅ 30-minute average delivery time</li>
          </ul>
        </div>

        <p className="font-bold text-gray-900 mb-1">Didn't create an account?</p>
        <p className="text-gray-700 mb-4">
          If you didn't sign up for Declan Foods, you can safely ignore this email. No account will be created
          and no further emails will be sent.
        </p>
        <p className="text-gray-700">
          Once verified, you'll be able to start shopping for fresh groceries and earning rewards immediately.
          Welcome to the future of smart shopping!
        </p>
      </div>

      <EmailFooter email="support@declanfoods.com" />
    </div>
  );
}