import { create } from 'zustand';

import type { Category, Plan } from '../domain/entities/types';
import * as categoryRepo from '../data/repositories/categoryRepository';
import * as planRepo from '../data/repositories/planRepository';
import { detectAndMarkOverdue } from '../domain/services/recurrenceEngine';
import { applySnoozeSelection, type SnoozeSelection } from '../domain/services/snoozeEngine';
import { getTodayISO } from '../utils/dates';
import { cancelPlanNotifications, schedulePlanNotification } from '../notifications/scheduler';

async function refreshDigests(): Promise<void> {
  const { refreshDailyDigests } = await import('../notifications/dailyDigest');
  await refreshDailyDigests();
}

export function filterPlans(
  plans: Plan[],
  filter: PlanStore['filter'],
  searchQuery: string,
  categoryFilter: string | null,
): Plan[] {
  let filtered = [...plans];

  if (searchQuery) {
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  if (categoryFilter) {
    filtered = filtered.filter((p) => p.categoryId === categoryFilter);
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
  categoryFilter: string | null;
  filter: 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'upcoming';
  searchQuery: string;

  setSelectedDate: (date: string) => void;
  setFilter: (filter: PlanStore['filter']) => void;
  setCategoryFilter: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadPlansForDate: (date: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  createCategory: (name: string, color: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  createPlan: (input: Parameters<typeof planRepo.createPlan>[0]) => Promise<Plan>;
  completePlan: (id: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  updatePlan: (id: string, input: Parameters<typeof planRepo.updatePlan>[1]) => Promise<Plan | null>;
  undoDelete: () => Promise<void>;
  snoozePlan: (id: string, selection: SnoozeSelection) => Promise<void>;
  checkOverdue: () => Promise<Plan[]>;
  getFilteredPlans: () => Plan[];
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: [],
  selectedDate: getTodayISO(),
  isLoading: false,
  lastDeletedId: null,
  categories: [],
  categoryFilter: null,
  filter: 'all',
  searchQuery: '',

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadPlansForDate(date);
  },

  setFilter: (filter) => set({ filter }),
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  loadPlansForDate: async (date) => {
    set({ isLoading: true });
    const plans = await planRepo.getPlansForDate(date);
    set({ plans, isLoading: false });
  },

  loadCategories: async () => {
    const categories = await categoryRepo.getAllCategories();
    const { categoryFilter } = get();
    set({
      categories,
      categoryFilter: categoryFilter && categories.some((c) => c.id === categoryFilter)
        ? categoryFilter
        : null,
    });
  },

  createCategory: async (name, color) => {
    const category = await categoryRepo.createCategory(name, color);
    await get().loadCategories();
    return category;
  },

  deleteCategory: async (id) => {
    await categoryRepo.deleteCategory(id);
    const { categoryFilter, selectedDate } = get();
    if (categoryFilter === id) {
      set({ categoryFilter: null });
    }
    await get().loadCategories();
    await get().loadPlansForDate(selectedDate);
  },

  refreshAll: async () => {
    const { selectedDate } = get();
    await get().loadPlansForDate(selectedDate);
    await get().loadCategories();
  },

  createPlan: async (input) => {
    const plan = await planRepo.createPlan(input);
    await schedulePlanNotification(plan);
    await refreshDigests();
    await get().loadPlansForDate(plan.date);
    return plan;
  },

  completePlan: async (id) => {
    const { dismissPlanNotifications } = await import('../notifications/scheduler');
    await dismissPlanNotifications(id);
    await planRepo.completePlan(id);
    await refreshDigests();
    await get().loadPlansForDate(get().selectedDate);
  },

  deletePlan: async (id) => {
    await cancelPlanNotifications(id);
    await planRepo.deletePlan(id);
    set({ lastDeletedId: id });
    await refreshDigests();
    await get().loadPlansForDate(get().selectedDate);
  },

  updatePlan: async (id, input) => {
    const updated = await planRepo.updatePlan(id, input);
    if (updated) {
      set((state) => ({
        plans: state.plans.map((plan) => (plan.id === id ? updated : plan)),
      }));
      await refreshDigests();
    }
    return updated;
  },

  undoDelete: async () => {
    const { lastDeletedId } = get();
    if (!lastDeletedId) return;
    await planRepo.restorePlan(lastDeletedId);
    set({ lastDeletedId: null });
    await refreshDigests();
    await get().loadPlansForDate(get().selectedDate);
  },

  snoozePlan: async (id, selection) => {
    const { dismissPlanNotifications } = await import('../notifications/scheduler');
    await dismissPlanNotifications(id);
    const plan = await applySnoozeSelection(id, selection);
    if (plan) await schedulePlanNotification(plan);
    await refreshDigests();
    await get().loadPlansForDate(get().selectedDate);
  },

  checkOverdue: async () => {
    const overdue = await detectAndMarkOverdue();
    if (overdue.length > 0) {
      await get().loadPlansForDate(get().selectedDate);
    }
    return overdue;
  },

  getFilteredPlans: () =>
    filterPlans(get().plans, get().filter, get().searchQuery, get().categoryFilter),
}));

// Note: do not use getFilteredPlans() directly inside usePlanStore selectors.
// It returns a new array each call and causes infinite re-renders.
