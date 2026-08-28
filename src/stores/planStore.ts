import { create } from 'zustand';

import type { Category, Plan } from '../domain/entities/types';
import * as categoryRepo from '../data/repositories/categoryRepository';
import * as planRepo from '../data/repositories/planRepository';
import { detectAndMarkOverdue } from '../domain/services/recurrenceEngine';
import { snoozePlanByPreset } from '../domain/services/snoozeEngine';
import { getTodayISO } from '../utils/dates';
import { cancelPlanNotifications, schedulePlanNotification } from '../notifications/scheduler';

export function filterPlans(
  plans: Plan[],
  filter: PlanStore['filter'],
  searchQuery: string,
): Plan[] {
  let filtered = [...plans];

  if (searchQuery) {
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  switch (filter) {
    case 'pending':
      filtered = filtered.filter((p) => p.status === 'pending');
      break;
    case 'completed':
      filtered = filtered.filter((p) => p.status === 'completed');
      break;
    case 'overdue':
      filtered = filtered.filter((p) => p.status === 'overdue');
      break;
    case 'today':
      filtered = filtered.filter((p) => p.date === getTodayISO());
      break;
    case 'upcoming':
      filtered = filtered.filter(
        (p) => p.date >= getTodayISO() && p.status === 'pending',
      );
      break;
  }

  return filtered;
}

interface PlanStore {
  plans: Plan[];
  selectedDate: string;
  isLoading: boolean;
  lastDeletedId: string | null;
  categories: Category[];
  filter: 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'upcoming';
  searchQuery: string;

  setSelectedDate: (date: string) => void;
  setFilter: (filter: PlanStore['filter']) => void;
  setSearchQuery: (query: string) => void;
  loadPlansForDate: (date: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  refreshAll: () => Promise<void>;
  createPlan: (input: Parameters<typeof planRepo.createPlan>[0]) => Promise<Plan>;
  completePlan: (id: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  snoozePlan: (id: string, preset: string) => Promise<void>;
  checkOverdue: () => Promise<Plan[]>;
  getFilteredPlans: () => Plan[];
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: [],
  selectedDate: getTodayISO(),
  isLoading: false,
  lastDeletedId: null,
  categories: [],
  filter: 'all',
  searchQuery: '',

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadPlansForDate(date);
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  loadPlansForDate: async (date) => {
    set({ isLoading: true });
    const plans = await planRepo.getPlansForDate(date);
    set({ plans, isLoading: false });
  },

  loadCategories: async () => {
    await categoryRepo.seedCategories();
    const categories = await categoryRepo.getAllCategories();
    set({ categories });
  },

  refreshAll: async () => {
    const { selectedDate } = get();
    await get().loadPlansForDate(selectedDate);
    await get().loadCategories();
  },

  createPlan: async (input) => {
    const plan = await planRepo.createPlan(input);
    await schedulePlanNotification(plan);
    await get().loadPlansForDate(plan.date);
    return plan;
  },

  completePlan: async (id) => {
    await cancelPlanNotifications(id);
    await planRepo.completePlan(id);
    await get().loadPlansForDate(get().selectedDate);
  },

  deletePlan: async (id) => {
    await cancelPlanNotifications(id);
    await planRepo.deletePlan(id);
    set({ lastDeletedId: id });
    await get().loadPlansForDate(get().selectedDate);
  },

  undoDelete: async () => {
    const { lastDeletedId } = get();
    if (!lastDeletedId) return;
    await planRepo.restorePlan(lastDeletedId);
    set({ lastDeletedId: null });
    await get().loadPlansForDate(get().selectedDate);
  },

  snoozePlan: async (id, preset) => {
    await cancelPlanNotifications(id);
    const plan = await snoozePlanByPreset(id, preset);
    if (plan) await schedulePlanNotification(plan);
    await get().loadPlansForDate(get().selectedDate);
  },

  checkOverdue: async () => {
    const overdue = await detectAndMarkOverdue();
    if (overdue.length > 0) {
      await get().loadPlansForDate(get().selectedDate);
    }
    return overdue;
  },

  getFilteredPlans: () => filterPlans(get().plans, get().filter, get().searchQuery),
}));

// Note: do not use getFilteredPlans() directly inside usePlanStore selectors.
// It returns a new array each call and causes infinite re-renders.
