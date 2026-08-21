import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';

type RiderTopBarProps = {
  title: string;
  onBack?: () => void;
  closeIcon?: boolean;
};

export default function RiderTopBar({ title, onBack, closeIcon }: RiderTopBarProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-3 border-b border-primary/10 bg-[#F3F7EE] px-4 py-4">
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Go back"
        className="text-primary"
      >
        {closeIcon ? <X size={22} strokeWidth={2} /> : <ArrowLeft size={22} strokeWidth={2} />}
      </button>
      <h1 className="text-lg font-bold text-primary">{title}</h1>
    </header>
  );
}