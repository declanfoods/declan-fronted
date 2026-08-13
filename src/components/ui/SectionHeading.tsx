import {type PropsWithChildren } from 'react';
import { cn } from '../utils/cn';

type SectionHeadingProps = PropsWithChildren<{
  className?: string;
  align?: 'left' | 'center';
}>;

/**
 * Splits children on the last word so the final word uses the accent
 * (orange) color. If children is a plain string like "DEALS OF THE DAY!",
 * it renders as green+orange automatically. Pass `accentIndex` override
 * via a sibling prop-less pattern by simply including a <span> yourself.
 */
export default function SectionHeading({
  children,
  className,
  align = 'center',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  if (typeof children === 'string') {
    const words = children.split(' ');
    const last = words.pop() ?? '';
    const head = words.join(' ');
    return (
      <h2
        className={cn(
          'text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight',
          alignment,
          className,
        )}
      >
        {head && <span className="text-primary">{head} </span>}
        <span className="text-accent">{last}</span>
      </h2>
    );
  }

  return (
    <h2
      className={cn(
        'text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight',
        alignment,
        className,
      )}
    >
      {children}
    </h2>
  );
}
