'use client';

import { Toast } from '@/shared/ui/Toast';
import { useUiStore } from '../model/ui-store';

export function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}
