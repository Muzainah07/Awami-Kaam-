import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { initSentry } from './lib/sentry';

initSentry();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <OfflineBanner />
    <App />
  </ErrorBoundary>
);
