import { create } from 'zustand';

export type DialogAccent = 'default' | 'danger' | 'warning';

export interface DialogHighlight {
  color: string;
  label: string;
}

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  accent?: DialogAccent;
  destructive?: boolean;
  highlight?: DialogHighlight;
}

type DialogVariant = 'confirm' | 'alert';

interface DialogStore {
  visible: boolean;
  variant: DialogVariant;
  options: DialogOptions | null;
  showConfirm: (options: DialogOptions) => Promise<boolean>;
  showAlert: (options: DialogOptions) => Promise<void>;
  confirm: () => void;
  cancel: () => void;
}

let pendingResolve: ((confirmed: boolean) => void) | null = null;

const closeDialog = (confirmed: boolean) => {
  pendingResolve?.(confirmed);
  pendingResolve = null;
  useDialogStore.setState({ visible: false, options: null });
};

export const useDialogStore = create<DialogStore>(() => ({
  visible: false,
  variant: 'confirm',
  options: null,

  showConfirm: (options) =>
    new Promise<boolean>((resolve) => {
      pendingResolve = resolve;
      useDialogStore.setState({ visible: true, variant: 'confirm', options });
    }),

  showAlert: (options) =>
    new Promise<void>((resolve) => {
      pendingResolve = () => resolve();
      useDialogStore.setState({ visible: true, variant: 'alert', options });
    }),

  confirm: () => closeDialog(true),
  cancel: () => closeDialog(false),
}));
