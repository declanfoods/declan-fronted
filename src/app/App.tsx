import { BrowserRouter, useRoutes } from 'react-router-dom';
import { adminRoutes } from './routes/admin';
import { customerRoutes } from './routes/customer';
import { publicRoutes } from './routes/public';
import { riderRoutes } from './routes/rider';

const routes = [...customerRoutes, ...adminRoutes, ...riderRoutes, ...publicRoutes];

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white text-ink">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
