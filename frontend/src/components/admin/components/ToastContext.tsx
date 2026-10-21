import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from './Toast';

export type ToastType = 'success' | 'error' | 'confirm';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ToastAPI {
    success: (message: string) => void;
    error: (message: string) => void;
    confirm: (message: string, onConfirm: () => void) => void;
    dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const nextId = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = useCallback((message: string) => {
        const id = nextId.current++;
        setToasts(prev => [...prev, { id, type: 'success', message }]);
        setTimeout(() => dismiss(id), 3000);
    }, [dismiss]);

    const error = useCallback((message: string) => {
        const id = nextId.current++;
        setToasts(prev => [...prev, { id, type: 'error', message }]);
    }, []);

    const confirm = useCallback((message: string, onConfirm: () => void) => {
        const id = nextId.current++;
        setToasts(prev => [...prev, {
            id,
            type: 'confirm',
            message,
            onConfirm: () => { onConfirm(); dismiss(id); },
            onCancel: () => dismiss(id),
        }]);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ success, error, confirm, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast(): ToastAPI {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
}
