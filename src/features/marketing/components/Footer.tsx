import Container from '../../../shared/ui/Container';

import Logo from "../../../shared/ui/Logo";

import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'Product Catalog', to: '/app/shop' },
];

const legalLabels = ['Privacy Policy', 'Referral Policy', 'Rewards Terms', 'Terms of Service'];

export default function Footer() {
  return (
    <footer id="contact" className="bg-white lg:bg-[#f8faf4]">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo className="h-16 w-auto" />
          <p className="text-sm text-gray-500">
            Nigeria's smartest food delivery platform with rewards that
            actually matter.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-base font-bold text-gray-900">Quick Links</h2>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            {quickLinks.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-primary">{label}</Link>
              </li>
            ))}
            <li><a href="#rewards" className="transition-colors hover:text-primary">Rewards Program</a></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-base font-bold text-gray-900">Support</h2>
          <a href="mailto:support@declanfoods.com" className="text-sm text-gray-500 hover:text-primary">
            Contact Us
          </a>
        </div>
        <div>
          <h2 className="mb-4 text-base font-bold text-gray-900">Legal</h2>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            {legalLabels.map((label) => <li key={label}>{label}</li>)}
          </ul>
        </div>
      </Container>

      <Container className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 Declan Foods. All rights reserved. | Built with{" "}
        <span className="text-accent">♥</span> for Nigerian students
      </Container>
    </footer>
  );
}
