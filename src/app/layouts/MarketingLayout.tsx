import { Outlet } from 'react-router-dom';
import Footer from '../../features/marketing/components/Footer';
import Navbar from '../../features/marketing/components/Navbar';

export default function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
