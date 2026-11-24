import { type PropsWithChildren } from 'react';
import AppTopBar from './AppTopBar';
import BottomNav from './BottomNav';

type AppLayoutProps = PropsWithChildren<{
  title: string;
  className?: string;
}>;

export default function AppLayout({ title, className, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppTopBar title={title} />
      <main className={'flex-1 px-4 pb-8 pt-6 sm:px-6 ' + (className ?? '')}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
