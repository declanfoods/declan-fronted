import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { queryClient } from './app/lib/query-client';

/*
|--------------------------------------------------------------------------
| FIX: QueryClientProvider was missing entirely
|--------------------------------------------------------------------------
| `@tanstack/react-query` was in package.json but the provider was never
| mounted, so any `useQuery` call would have thrown
| "No QueryClient set, use QueryClientProvider to set one".
|
| The whole API-wiring effort depends on this, so it goes in first.
| ToastProvider is mounted here so the `useToast()` hook works app-wide
| (it throws "useToast must be used within a ToastProvider" otherwise).
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>
);
