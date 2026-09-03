import React, { useSyncExternalStore } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from './Icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

// --- Store global (independiente del árbol React: se puede llamar desde cualquier handler) ---
let nextId = 1;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function showToast(type: ToastType, message: string, durationMs = 5000) {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }];
  if (toasts.length > 5) toasts = toasts.slice(toasts.length - 5); // máx 5 visibles
  emit();
  window.setTimeout(() => dismissToast(id), durationMs);
}

export const toast = {
  success: (message: string) => showToast('success', message, 5000),
  error: (message: string) => showToast('error', message, 8000),
  info: (message: string) => showToast('info', message, 5000),
  warning: (message: string) => showToast('warning', message, 7000),
};

// --- Puente: convierte los alert() nativos (descentrados en WebKitGTK) en toasts.
// Los confirm() destructivos usan ConfirmDialog (diálogo propio centrado).
export function installToastAlertBridge() {
  if (typeof window === 'undefined') return;
  if ((window as any).__cuadernoToastBridgeInstalled) return;
  (window as any).__cuadernoToastBridgeInstalled = true;
  const original = window.alert.bind(window);
  window.alert = (message?: unknown) => {
    const text = String(message ?? '');
    const lower = text.toLowerCase();
    if (lower.includes('error') || lower.includes('no se pudo') || lower.includes('falló') || lower.includes('fallido') || lower.includes('inválido') || lower.includes('incorrecto')) {
      toast.error(text);
    } else if (lower.includes('éxito') || lower.includes('correctamente') || lower.includes('guardad') || lower.includes('importad') || lower.includes('exportad') || lower.includes('copiad') || lower.includes('eliminad') || lower.includes('cread') || lower.includes('actualizad') || lower.includes('✅') || lower.includes('backup') || lower.includes('restaurad')) {
      toast.success(text);
    } else {
      toast.info(text);
    }
    // Mantener referencia al original para depuración (no se usa en producción)
    void original;
  };
}

// --- UI ---
const TYPE_STYLES: Record<ToastType, { box: string; icon: string; Icon: React.FC<{ className?: string }> }> = {
  success: { box: 'bg-emerald-50 border-emerald-300 text-emerald-900', icon: 'text-emerald-500', Icon: CheckCircleIcon },
  error: { box: 'bg-red-50 border-red-300 text-red-900', icon: 'text-red-500', Icon: XCircleIcon },
  info: { box: 'bg-sky-50 border-sky-300 text-sky-900', icon: 'text-sky-500', Icon: InformationCircleIcon },
  warning: { box: 'bg-amber-50 border-amber-300 text-amber-900', icon: 'text-amber-500', Icon: ExclamationTriangleIcon },
};

export const ToastContainer: React.FC = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
      <style>{`
        @keyframes cdToastIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cd-toast { animation: cdToastIn 0.22s ease-out both; }
      `}</style>
      {items.map((item) => {
        const s = TYPE_STYLES[item.type];
        const Icon = s.Icon;
        return (
          <div
            key={item.id}
            className={`cd-toast pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-md ${s.box}`}
            role="status"
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${s.icon}`} />
            <p className="text-sm leading-snug flex-1 break-words min-w-0 whitespace-pre-wrap">{item.message}</p>
            <button
              onClick={() => dismissToast(item.id)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
              title="Cerrar notificación"
            >
              <XMarkIcon className="w-4 h-4 opacity-60" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
