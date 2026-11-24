import { type PropsWithChildren } from 'react';
import AppTopBar from './AppTopBar';
import BottomNav from './BottomNav';
import DesktopNavigation from './DesktopNavigation';

type AppLayoutProps = PropsWithChildren<{
  title: string;
  className?: string;
  desktopNavigation?: boolean;
}>;

export default function AppLayout({ title, className, desktopNavigation = false, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {desktopNavigation ? (
        <>
          <div className="hidden lg:block"><DesktopNavigation /></div>
          <div className="lg:hidden"><AppTopBar title={title} /></div>
        </>
      ) : (
        <AppTopBar title={title} />
      )}
      <main className={'flex-1 px-4 pb-8 pt-6 sm:px-6 ' + (className ?? '')}>
        {children}
      </main>
      <BottomNav className={desktopNavigation ? 'lg:hidden' : undefined} />
    </div>
  );
}
