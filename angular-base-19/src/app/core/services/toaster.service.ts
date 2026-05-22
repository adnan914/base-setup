import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const toast: Toast = { message, type };

    // Add new toast
    this.messages.update(list => [...list, toast]);
    console.log(this.messages, toast)

    // Auto remove after duration
    setTimeout(() => {
      this.messages.update(list => list.filter(t => t !== toast));
    }, duration);
  }

  success(msg: string, duration?: number) {
    this.show(msg, 'success', duration);
  }

  error(msg: string, duration?: number) {
    this.show(msg, 'error', duration);
  }

  warning(msg: string, duration?: number) {
    this.show(msg, 'warning', duration);
  }

  info(msg: string, duration?: number) {
    this.show(msg, 'info', duration);
  }
}
