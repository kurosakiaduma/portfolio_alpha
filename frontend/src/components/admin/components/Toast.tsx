import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import type { Toast } from './ToastContext';

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const isSuccess = toast.type === 'success';
    const isError = toast.type === 'error';
    const isConfirm = toast.type === 'confirm';

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[280px] max-w-sm
                ${isSuccess ? 'bg-slate-900 border-cyan-800 text-cyan-100' : ''}
                ${isError ? 'bg-slate-900 border-red-800 text-red-100' : ''}
                ${isConfirm ? 'bg-slate-900 border-yellow-700 text-yellow-100' : ''}
            `}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle size={18} className="text-cyan-400" />}
                {isError && <AlertCircle size={18} className="text-red-400" />}
                {isConfirm && <AlertTriangle size={18} className="text-yellow-400" />}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{toast.message}</p>
                {isConfirm && (
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={toast.onConfirm}
                            className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded transition"
                        >
                            Confirm
                        </button>
                        <button
                            onClick={toast.onCancel}
                            className="px-3 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {!isConfirm && (
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="flex-shrink-0 p-0.5 text-slate-500 hover:text-slate-300 transition"
                    aria-label="Dismiss"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2"
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}
