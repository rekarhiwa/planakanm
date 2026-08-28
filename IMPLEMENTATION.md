# پلانەکانم — Implementation Summary

## What Was Implemented

A complete offline-first Kurdish productivity app with:

- **Home dashboard** — greeting, Now/Overdue/Today/Upcoming sections, morning/evening/no-time grouping
- **Quick create** — bottom sheet with 2–3 tap flow, optional time, advanced repeat/priority/alarm
- **Smart snooze** — 5/10/15/30 min, 1h, 2h, tomorrow, custom presets + overdue dialog
- **Local notifications** — scheduled reminders, overdue alerts, action buttons (complete/snooze/open)
- **Calendar views** — week (with plan counts), month (dot indicators), year (12-month overview)
- **Plan CRUD** — create, complete, snooze, delete with undo, detail screen with history
- **Recurring plans** — daily, weekly, monthly, yearly via RecurrenceEngine
- **Search & filters** — instant local search, filter chips (all/pending/completed/overdue/today/upcoming)
- **Statistics** — today/week/month completion rates, streak, missed/snoozed counts, bar chart
- **Settings** — language (ku/ar/en), theme (light/dark/system), notifications, export/import JSON
- **Onboarding** — 3-screen flow with notification permission request
- **NLP quick-add** — rule-based Kurdish parser ("سبەی کاتژمێر 8 خوێندن")
- **RTL + i18n** — Noto Kufi Arabic font, Kurdish default, full string externalization
- **Dark mode** — independently designed gold (#D4AF37) on black (#0A0A0A)
- **Swipe gestures** — swipe right to complete, swipe left for snooze/delete

## Architecture

```
UI (screens/components) → Zustand stores → Domain services → Repositories → SQLite (Drizzle)
                                                         ↘ Notification scheduler
```

## Database

- **Engine:** expo-sqlite + Drizzle ORM
- **Tables:** plans, categories, plan_history, settings
- **Sync-ready:** UUID ids, updatedAt, soft delete (deletedAt)

## Notification System

- expo-notifications with Android channels (reminders, alarms, overdue)
- Smart scheduling window (max 60 notifications, reconcile on app launch)
- Notification action categories for complete/snooze/open
- Requires dev build for full action button support (not Expo Go)

## Tests

12 unit tests passing:
- NLP parser (Kurdish patterns)
- Snooze duration calculations
- Recurrence date generation
- Plan time grouping

Run: `npm test` | Typecheck: `npm typecheck`

## Known Limitations

- Android ~500 notification cap mitigated by rolling window
- Exact alarms require Android 12+ permission grant
- iOS background execution limited; relies on OS scheduling + foreground reconcile
- NLP is rule-based only (no AI); ambiguous input shows confirmation
- Boot reschedule requires dev build with expo-task-manager background task

## Getting Started

```bash
npm install
npm start          # Expo Go (basic features)
npx expo run:android  # Dev build (full notifications)
```
