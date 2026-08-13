import { type PropsWithChildren } from 'react';
import { cn } from '../utils/cn';

type SectionProps = PropsWithChildren<{
  className?: string;
  id?: string;
}>;

export default function Section({ children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', className)}>
      {children}
    </section>
  );
}
