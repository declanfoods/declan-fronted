import { Outlet } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';

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
