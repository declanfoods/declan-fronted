export default function EmailFooter({ email }: { email: string }) {
  return (
    <div className="text-center text-sm text-gray-500 py-8 px-6 space-y-2">
      <p>Need help? Contact our support team at {email} or call +234 800 DECLAN (332526)</p>
      <p>This verification code was sent to: customer@example.com</p>
      <p>© 2026 Declan Foods. All rights reserved.</p>
      <p>123 Business District, Lagos, Nigeria</p>
      <p>You received this email because you signed up for a Declan Foods account</p>
      <p>
        <a href="#" className="underline">Unsubscribe</a> | <a href="#" className="underline">Privacy Policy</a> | <a href="#" className="underline">Manage Notifications</a>
      </p>
    </div>
  );
}