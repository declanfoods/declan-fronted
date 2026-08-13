// Navbar.tsx
import { useState } from 'react';
import { Link } from 'react-router';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

interface NavbarProps {
  navItems?: string[];
}

const DEFAULT_ITEMS = ['Contact', 'About', 'Home', 'Login'];

export default function Navbar({ navItems = DEFAULT_ITEMS }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="px-4 pt-4 sm:px-6">
      <nav className="flex items-center justify-between rounded-[28px] bg-white px-6 py-4 shadow-md sm:px-10 sm:py-5">
        {/* Logo — big, no constraints choking it */}
        <Link to="/" className="flex items-center">
          <Logo className="h-16 w-auto sm:h-20" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-lg font-medium text-primary transition-colors hover:text-primary-dark"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Shop Now button */}
        <div className="hidden md:flex">
          <Button variant="primary" className="rounded-full px-8 py-3 text-base">
            Shop Now
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary md:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mx-1 mt-2 flex flex-col gap-3 rounded-2xl bg-white px-6 py-4 shadow-md">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="border-b border-gray-100 py-2 text-lg font-medium text-primary"
            >
              {item}
            </Link>
          ))}
          <Button variant="primary" className="mt-2 w-full rounded-full py-3 text-base">
            Shop Now
          </Button>
        </div>
      )}
    </header>
  );
}