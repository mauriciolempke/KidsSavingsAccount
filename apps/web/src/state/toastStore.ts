/**
 * Toast Store
 * Simple state management for toast notifications
 */

import { ToastMessage } from '../components/ui/Toast';

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastStore {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getToasts(): ToastMessage[] {
    return this.toasts;
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  addToast(message: string, type: ToastMessage['type'] = 'info', duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = { id, message, type, duration };
    
    this.toasts = [...this.toasts, toast];
    this.notify();

    return id;
  }

  success(message: string, duration?: number) {
    return this.addToast(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.addToast(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    return this.addToast(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    return this.addToast(message, 'info', duration);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

export const toastStore = new ToastStore();

