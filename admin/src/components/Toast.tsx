import { useEffect } from 'react';
import type { ToastState } from '../types';

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast, onClose]);

  if (!toast) {
    return null;
  }

  return (
    <div className={`toast toast--${toast.variant}`}>
      <span>{toast.message}</span>
      <button type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
