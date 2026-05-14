export interface ToastParams {
  message: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

type Listener = (params: ToastParams) => void;

let listener: Listener | null = null;

export const ToastEmitter = {
  show: (params: ToastParams) => listener?.(params),
  success: (message: string, description?: string) =>
    listener?.({ message, description, type: 'success' }),
  error: (message: string, description?: string) =>
    listener?.({ message, description, type: 'error' }),
  info: (message: string, description?: string) =>
    listener?.({ message, description, type: 'info' }),
  warning: (message: string, description?: string) =>
    listener?.({ message, description, type: 'warning' }),
  _setListener: (fn: Listener) => { listener = fn; },
  _clearListener: () => { listener = null; },
};
