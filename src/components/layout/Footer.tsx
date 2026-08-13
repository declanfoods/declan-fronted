import Container from './Container';

import Logo from "../ui/Logo";

export default function Footer() {
  const columns = [
    {
      title: "Quick Links",
      items: ["Home", "Track Order", "Product Catalog", "Rewards Program"],
    },
    {
      title: "Support",
      items: ["Help Center", "Contact Us", "Delivery Info"],
    },
    {
      title: "Legal",
      items: ["Privacy Policy", "Referral Policy", "Rewards Terms", "Terms of Service"],
    },
  ];

  return (
    <footer className="bg-white">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo className="h-16 w-auto" />
          <p className="text-sm text-gray-500">
            Nigeria's smartest food delivery platform with rewards that
            actually matter.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-base font-bold text-gray-900">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-gray-500">
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:text-primary">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <Container className="border-t border-gray-200 py-6 text-center text-sm text-gray-400">
        © 2026 Declan Foods. All rights reserved. | Built with{" "}
        <span className="text-accent">♥</span> for Nigerian students
      </Container>
    </footer>
  );
}