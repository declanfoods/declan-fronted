import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import FloatingPillBar from '../ui/FloatingPillBar';
import AppMenuDropdown from './AppMenuDropdown';
import NotificationBell from '../pages/app/NotificationBell';

type AppTopBarProps = {
  title: string;
};

export default function AppTopBar({ title }: AppTopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <FloatingPillBar>
        <div className="flex items-center gap-2">
          <Logo className="h-14 w-auto" />
        </div>

        <h1 className="text-lg font-semibold text-ink sm:text-xl">{title}</h1>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/5"
          >
            {menuOpen ? <X size={24} strokeWidth={2} /> : <Menu size={24} strokeWidth={2} />}
          </button>
        </div>
      </FloatingPillBar>

      {menuOpen && (
        <div className="mx-4 mt-2 sm:mx-6">
          <AppMenuDropdown onClose={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}