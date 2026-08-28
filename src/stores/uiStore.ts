import { create } from 'zustand';

interface UIStore {
  showQuickCreate: boolean;
  showSnoozeSheet: boolean;
  snoozePlanId: string | null;
  showOverdueDialog: boolean;
  overduePlans: string[];
  showUndoSnackbar: boolean;
  undoMessage: string;
  showOnboarding: boolean;

  openQuickCreate: () => void;
  closeQuickCreate: () => void;
  openSnooze: (planId: string) => void;
  closeSnooze: () => void;
  setOverdueDialog: (show: boolean, planIds?: string[]) => void;
  showUndo: (message: string) => void;
  hideUndo: () => void;
  setShowOnboarding: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showQuickCreate: false,
  showSnoozeSheet: false,
  snoozePlanId: null,
  showOverdueDialog: false,
  overduePlans: [],
  showUndoSnackbar: false,
  undoMessage: '',
  showOnboarding: false,

  openQuickCreate: () => set({ showQuickCreate: true }),
  closeQuickCreate: () => set({ showQuickCreate: false }),
  openSnooze: (planId) => set({ showSnoozeSheet: true, snoozePlanId: planId }),
  closeSnooze: () => set({ showSnoozeSheet: false, snoozePlanId: null }),
  setOverdueDialog: (show, planIds = []) =>
    set({ showOverdueDialog: show, overduePlans: planIds }),
  showUndo: (message) => set({ showUndoSnackbar: true, undoMessage: message }),
  hideUndo: () => set({ showUndoSnackbar: false, undoMessage: '' }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
}));
