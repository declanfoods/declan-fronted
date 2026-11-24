import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Button from '../../../shared/ui/Button';
import Logo from '../../../shared/ui/Logo';

const links = [
  { label: 'Contact', href: '#contact' },
  { label: 'About', href: '#about' },
  { label: 'Home', href: '/' },
  { label: 'Login', href: '/login' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const renderLinks = (className: string) => links.map(({ label, href }) =>
    href.startsWith('#') ? (
      <a key={href} href={href} onClick={() => setMobileOpen(false)} className={className}>
        {label}
      </a>
    ) : (
      <Link key={href} to={href} onClick={() => setMobileOpen(false)} className={className}>
        {label}
      </Link>
    ),
  );

  return (
    <header className="px-4 pt-4 sm:px-6 lg:border-b lg:border-[#e3e9df] lg:px-8 lg:pt-0">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[76rem] items-center justify-between rounded-[28px] bg-white px-6 py-4 shadow-md sm:px-10 sm:py-5 lg:gap-6 lg:rounded-none lg:px-0 lg:py-2 lg:shadow-none">
        <Link to="/" aria-label="Declan Foods home" className="flex shrink-0 items-center">
          <Logo className="h-16 w-auto sm:h-20 lg:h-[72px]" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-10 md:flex lg:hidden">
          {renderLinks('text-lg font-medium text-primary transition-colors hover:text-primary-dark')}
        </div>

        {/* Shop Now button */}
        <div className="hidden md:flex lg:hidden">
          <Button variant="primary" className="rounded-full px-8 py-3 text-base" onClick={() => navigate('/app/shop')}>
            Shop Now
          </Button>
        </div>

        <div className="hidden items-center gap-6 text-sm font-semibold text-[#234a30] lg:flex xl:gap-9">
          <a href="#deals" className="transition-colors hover:text-primary">Deals</a>
          <a href="#rewards" className="transition-colors hover:text-primary">Rewards</a>
          <a href="#about" className="transition-colors hover:text-primary">How it works</a>
          <Link to="/track-order" className="transition-colors hover:text-primary">Track Order</Link>
        </div>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <Link to="/login" className="text-sm font-semibold text-[#234a30] transition-colors hover:text-primary">Login</Link>
          <Link
            to="/app/shop"
            className="inline-flex items-center gap-2 rounded-full bg-[#245b38] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#153526]"
          >
            Shop Now <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary md:hidden"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mx-1 mt-2 flex flex-col gap-3 rounded-2xl bg-white px-6 py-4 shadow-md md:hidden">
          {renderLinks('border-b border-gray-100 py-2 text-lg font-medium text-primary')}
          <Button
            className="mt-2 w-full rounded-full py-3 text-base"
            onClick={() => {
              setMobileOpen(false);
              navigate('/app/shop');
            }}
          >
            Shop Now
          </Button>
        </div>
      )}
    </header>
  );
}
