import type { CreatePlanInput } from '../entities/types';
import { formatDateISO, getTodayISO, getTomorrowISO } from '../../utils/dates';

export interface ParsedPlan {
  title: string;
  date?: string;
  time?: string;
  hasTime: boolean;
  repeatType?: CreatePlanInput['repeatType'];
  confidence: 'high' | 'medium' | 'low';
}

const TODAY_WORDS = ['ئەمڕۆ', 'امڕۆ', 'today', 'اليوم'];
const TOMORROW_WORDS = ['سبەی', 'سبه', 'tomorrow', 'غدا', 'غداً'];
const TIME_PATTERNS = [
  /کاتژمێر\s*(\d{1,2})(?::(\d{2}))?/,
  /(\d{1,2}):(\d{2})/,
  /(\d{1,2})\s*(?:بەیانی|ئێوارە|شەو|am|pm|AM|PM)/,
  /(?:بەیانی|morning)\s*(\d{1,2})/,
  /(?:ئێوارە|شەو|evening|night)\s*(\d{1,2})/,
];
const DAILY_WORDS = ['هەموو ڕۆژ', 'هەر ڕۆژ', 'every day', 'daily', 'يوميا'];
const WEEKLY_WORDS = ['هەموو هەفتە', 'weekly', 'أسبوعيا'];

export function parseNaturalLanguage(input: string): ParsedPlan {
  const trimmed = input.trim();
  let title = trimmed;
  let date: string | undefined;
  let time: string | undefined;
  let hasTime = false;
  let repeatType: CreatePlanInput['repeatType'] = 'none';
  let confidence: ParsedPlan['confidence'] = 'low';

  for (const word of TODAY_WORDS) {
    if (trimmed.includes(word)) {
      date = getTodayISO();
      title = title.replace(word, '').trim();
      confidence = 'medium';
      break;
    }
  }

  for (const word of TOMORROW_WORDS) {
    if (trimmed.includes(word)) {
      date = getTomorrowISO();
      title = title.replace(word, '').trim();
      confidence = 'medium';
      break;
    }
  }

  for (const pattern of TIME_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = match[2] ? parseInt(match[2], 10) : 0;
      if (h >= 0 && h <= 23) {
        time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        hasTime = true;
        title = title.replace(match[0], '').trim();
        confidence = confidence === 'medium' ? 'high' : 'medium';
      }
      break;
    }
  }

  for (const word of DAILY_WORDS) {
    if (trimmed.includes(word)) {
      repeatType = 'daily';
      title = title.replace(word, '').trim();
      break;
    }
  }

  for (const word of WEEKLY_WORDS) {
    if (trimmed.includes(word)) {
      repeatType = 'weekly';
      title = title.replace(word, '').trim();
      break;
    }
  }

  title = title.replace(/\s+/g, ' ').trim();

  if (!date) date = getTodayISO();
  if (!title) title = trimmed;

  return { title, date, time, hasTime, repeatType, confidence };
}

export function parsedToCreateInput(parsed: ParsedPlan): CreatePlanInput {
  return {
    title: parsed.title,
    date: parsed.date ?? getTodayISO(),
    time: parsed.time,
    hasTime: parsed.hasTime,
    repeatType: parsed.repeatType ?? 'none',
  };
}
