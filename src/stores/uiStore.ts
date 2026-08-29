import { create } from 'zustand';

interface UIStore {
  showSnoozeSheet: boolean;
  snoozePlanId: string | null;
  showOverdueDialog: boolean;
  overduePlans: string[];
  showUndoSnackbar: boolean;
  undoMessage: string;
  showOnboarding: boolean;
  showAlarmScreen: boolean;
  alarmPlanId: string | null;

  openSnooze: (planId: string) => void;
  closeSnooze: () => void;
  setOverdueDialog: (show: boolean, planIds?: string[]) => void;
  showUndo: (message: string) => void;
  hideUndo: () => void;
  setShowOnboarding: (show: boolean) => void;
  openAlarmScreen: (planId: string) => void;
  closeAlarmScreen: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showSnoozeSheet: false,
  snoozePlanId: null,
  showOverdueDialog: false,
  overduePlans: [],
  showUndoSnackbar: false,
  undoMessage: '',
  showOnboarding: false,
  showAlarmScreen: false,
  alarmPlanId: null,

  openSnooze: (planId) => set({ showSnoozeSheet: true, snoozePlanId: planId }),
  closeSnooze: () => set({ showSnoozeSheet: false, snoozePlanId: null }),
  setOverdueDialog: (show, planIds = []) =>
    set({ showOverdueDialog: show, overduePlans: planIds }),
  showUndo: (message) => set({ showUndoSnackbar: true, undoMessage: message }),
  hideUndo: () => set({ showUndoSnackbar: false, undoMessage: '' }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  openAlarmScreen: (planId) => set({ showAlarmScreen: true, alarmPlanId: planId }),
  closeAlarmScreen: () => set({ showAlarmScreen: false, alarmPlanId: null }),
}));
