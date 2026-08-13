import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";

export default function ReferralBonusEmail() {
  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
           <Logo className="h-17 w-12" />
        </div>
        <h1 className="text-white text-2xl font-bold">Declan Foods Notification</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-6">Hello John Adebayo!👋</p>

        <div className="bg-accent/15 rounded-xl text-center py-8 px-6 mb-6">
          <div className="text-3xl mb-2">🔔</div>
          <h2 className="text-accent text-2xl font-semibold">Referral Bonus Earned!</h2>
        </div>

        <p className="text-gray-700 mb-2">Great news! You've earned a referral bonus. Keep sharing and earning!</p>
        <p className="text-gray-700 mb-6">
          Congratulations! Your friend Sarah Okafor has successfully signed up using your referral code.
          Your ₦300 referral bonus has been credited to your account.
        </p>

        <div className="bg-primary/15 rounded-xl p-6 mb-6">
          <p className="text-primary-dark font-bold mb-4">Details:</p>
          <div className="flex justify-between text-primary-dark mb-2">
            <span>Amount</span>
            <span>₦300</span>
          </div>
          <div className="flex justify-between text-primary-dark">
            <span>Referral</span>
            <span>Sarah Okafor</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <a href="#" className="inline-block bg-primary text-white font-semibold rounded-xl px-10 py-4">
            View Dashboard
          </a>
        </div>

        <p className="text-gray-700">
          Keep earning! Share your referral code with more friends and family to earn ₦300 for each successful signup.
        </p>
      </div>

      <EmailFooter email="support@declanfoods.com" />
    </div>
  );
}

