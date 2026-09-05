type AlarmHandler = (planId: string) => void;

let alarmHandler: AlarmHandler | null = null;

export function setAlarmReceivedHandler(handler: AlarmHandler | null): void {
  alarmHandler = handler;
}

export function notifyAlarmReceived(planId: string): void {
  alarmHandler?.(planId);
}

export function isFullscreenReminder(reminderType: unknown): boolean {
  // Timed plan reminders are fullscreen alarms; only explicit "notification" stays soft.
  return reminderType !== 'notification';
}
