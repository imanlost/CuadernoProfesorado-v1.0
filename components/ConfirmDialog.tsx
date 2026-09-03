import React, { useSyncExternalStore } from 'react';
import Modal from './Modal';

// --- Diálogo de confirmación propio (centrado, mismo estilo que el resto de la app).
// Sustituye a window.confirm: los diálogos nativos de WebKitGTK salen descentrados
// y fuera de la ventana de la aplicación.
//
// Uso: const ok = await confirmDialog('¿Seguro?', { danger: true });
// El componente <ConfirmDialogHost/> debe montarse una vez en la app.

interface ConfirmRequest {
  message: string;
  danger: boolean;
  resolve: (value: boolean) => void;
}

let current: ConfirmRequest | null = null;
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

function getSnapshot(): ConfirmRequest | null {
  return current;
}

export function confirmDialog(message: string, opts?: { danger?: boolean }): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    current = { message, danger: !!opts?.danger, resolve };
    emit();
  });
}

function settle(value: boolean) {
  const req = current;
  current = null;
  emit();
  req?.resolve(value);
}

export const ConfirmDialogHost: React.FC = () => {
  const req = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (!req) return null;

  return (
    <Modal
      isOpen={!!req}
      onClose={() => settle(false)}
      title={req.danger ? 'Confirmar acción' : 'Confirmar'}
      size="md"
      resizable={false}
    >
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{req.message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => settle(false)}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => settle(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
            req.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {req.danger ? 'Sí, continuar' : 'Aceptar'}
        </button>
      </div>
    </Modal>
  );
};
