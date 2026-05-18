import { createContext, useContext, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import '../styles/Notification.css';

// ─── Context ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  expense: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

// ─── Custom Toast Component ───────────────────────────────────────────────────
function CustomToast({ t, message, type }) {
  return (
    <div className={`ht-toast ht-toast--${type} ${t.visible ? 'ht-enter' : 'ht-exit'}`}>
      {/* Coloured left accent */}
      <div className="ht-accent" />

      {/* Icon */}
      <div className="ht-icon">{ICONS[type] ?? ICONS.info}</div>

      {/* Message */}
      <p className="ht-message">{message}</p>

      {/* Close */}
      <button
        className="ht-close"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="ht-progress" style={{ animationDuration: `${t.duration ?? 4000}ms` }} />
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    return toast.custom(
      (t) => <CustomToast t={t} message={message} type={type} />,
      { duration, id: undefined }
    );
  }, []);

  const removeNotification = useCallback((id) => {
    toast.dismiss(id);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, removeNotification }}>
      {children}

      {/* react-hot-toast container — top-center, mobile-safe */}
      <Toaster
        position="top-center"
        gutter={10}
        containerStyle={{ top: 14 }}
        toastOptions={{ duration: 4000 }}
      />
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within <NotificationProvider>');
  return ctx;
}
