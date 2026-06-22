import { AlertCircle, AlertTriangle } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "error" | "warning";
  title: string;
  message: string;
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.type}`} key={toast.id} onAnimationEnd={() => onDismiss(toast.id)}>
          <span className="toast-icon">{toast.type === "error" ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}</span>
          <span className="toast-body">
            <strong>{toast.title}</strong>
            <small>{toast.message}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
