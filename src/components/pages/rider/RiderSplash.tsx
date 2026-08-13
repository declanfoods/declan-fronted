import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/brandlogo.png';

export default function RiderSplash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/rider/login'), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-8">
      <img src={logo} alt="Declan Foods" className="w-56 sm:w-64" />
      <p className="mt-4 text-sm font-medium text-primary italic">
        .....good food starts here
      </p>
    </div>
  );
}