import { type ReactNode } from 'react';

interface FloatingPillBarProps {
  children: ReactNode;
  className?: string;
}


export default function FloatingPillBar({ children, className }: FloatingPillBarProps) {
  return (
    <div className="relative">
      {/* Decorative corner blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-blob-tan"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -top-6 h-20 w-20 rounded-full bg-primary/30"
      />

      <div
        className={
          'relative mx-4 mt-4 flex items-center justify-between rounded-full border border-muted bg-white px-4 py-3 shadow-sm sm:mx-6 sm:px-6 ' +
          (className ?? '')
        }
      >
        {children}
      </div>
    </div>
  );
}