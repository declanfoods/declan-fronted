import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

type AdminTopBarProps = {
  title: string;
  onBack?: () => void;
  closeIcon?: boolean;
  right?: ReactNode;
};

export default function AdminTopBar({ title, onBack, closeIcon, right }: AdminTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-primary/10 bg-[#F3F7EE] px-4 py-4 sm:px-6">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Go back"
        className="flex h-9 w-9 items-center justify-center text-primary-dark"
      >
        {closeIcon ? <X size={22} strokeWidth={2} /> : <ArrowLeft size={22} strokeWidth={2} />}
      </button>

      <h1 className="text-lg font-bold text-primary-dark">{title}</h1>

      <div className="flex h-9 min-w-9 items-center justify-end gap-1 text-primary-dark">
        {right}
      </div>
    </header>
  );
}
