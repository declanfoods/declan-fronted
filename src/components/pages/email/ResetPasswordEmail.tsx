import Logo from "../../ui/Logo";
import EmailFooter from "./EmailFooter";

interface Props { name: string; resetUrl: string; ipAddress: string; timestamp: string }

export default function ResetPasswordEmail({ name, resetUrl,  }: Props) {
  return (
    <div className="max-w-xl mx-auto bg-white font-sans">
      <div className="bg-primary text-center py-10 px-6">
        <div className="bg-white rounded-xl inline-block px-8 py-6 mb-6">
          <Logo className="h-17 w-12" />
        </div>
        <h1 className="text-white text-2xl font-bold">Reset Your Password</h1>
      </div>

      <div className="bg-gray-50 px-6 py-8">
        <p className="text-gray-800 mb-4">Hello {name}!👋</p>
        <p className="text-gray-700 mb-6">
          We received a request to reset your password for your Declan Foods account. If you made this request,
          click the button below to reset your password.
        </p>

        <div className="bg-accent/15 rounded-xl text-center py-3 px-6 mb-6">
          <span className="text-accent">⏱ This verification link will expire in 24 hours</span>
        </div>

        <div className="text-center mb-6">
          <a href={resetUrl} className="inline-block bg-primary text-white font-semibold rounded-xl px-10 py-4">
            Start Shopping Now
          </a>
        </div>

        <p className="text-gray-700 mb-3">If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        <div className="bg-primary rounded-xl text-center py-4 px-6 mb-6">
          <p className="text-white font-semibold mb-1">Reset Link:</p>
          <p className="text-white break-all">{resetUrl}</p>
        </div>

        <p className="font-bold text-gray-900 mb-1">Didn't request this password reset?</p>
        <p className="text-gray-700 mb-6">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain
          unchanged and your account is secure.
        </p>

        <div className="bg-primary rounded-xl h-32 mb-6" />

        <p className="text-gray-700">
          After resetting your password, you'll be able to continue enjoying fresh groceries and earning rewards
          with Declan Foods.
        </p>
      </div>
<EmailFooter email="support@declanfoods.com" />
</div>
    
  );
}