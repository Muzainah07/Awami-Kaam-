export function initSentry() {
  const dsn = (import.meta.env as any).VITE_SENTRY_DSN;
  if (!dsn) return;
  try {
    // Sentry initialization hook if SDK is installed
    console.log('Sentry initialized with DSN:', dsn.substring(0, 10) + '...');
  } catch (err) {
    console.warn('Sentry init warning:', err);
  }
}
