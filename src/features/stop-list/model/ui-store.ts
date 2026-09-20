import { create } from 'zustand';

const TOAST_TTL_MS = 5000;

type Toast = {
  id: string;
  message: string;
};

type UiState = {
  panelItemId: string | null;
  toasts: Toast[];
  openPanel: (itemId: string) => void;
  closePanel: () => void;
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set, get) => ({
  panelItemId: null,
  toasts: [],
  openPanel: (itemId) => set({ panelItemId: itemId }),
  closePanel: () => set({ panelItemId: null }),
  pushToast: (message) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { id, message }] }));
    setTimeout(() => get().dismissToast(id), TOAST_TTL_MS);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
