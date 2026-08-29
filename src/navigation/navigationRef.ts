import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Main: undefined;
  PlanDetail: { planId: string };
  CreatePlan: { title?: string; description?: string } | undefined;
  Search: undefined;
  Onboarding: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToPlanDetail(planId: string): void {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('PlanDetail', { planId });
}

export function navigateToCreatePlan(prefill?: { title?: string; description?: string }): void {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('CreatePlan', prefill);
}
