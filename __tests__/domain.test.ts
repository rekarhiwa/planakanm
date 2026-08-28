import { parseNaturalLanguage, parsedToCreateInput } from '../src/domain/services/nlpParser';
import { addSnoozeDuration } from '../src/utils/dates';
import { SNOOZE_PRESETS } from '../src/domain/constants/snoozePresets';
import { generateRecurrenceDates } from '../src/utils/dates';

describe('NLP Parser', () => {
  it('parses tomorrow with time', () => {
    const result = parseNaturalLanguage('سبەی کاتژمێر 8 خوێندن');
    expect(result.title).toContain('خوێندن');
    expect(result.hasTime).toBe(true);
    expect(result.time).toBe('08:00');
    expect(result.confidence).not.toBe('low');
  });

  it('parses today keyword', () => {
    const result = parseNaturalLanguage('ئەمڕۆ وەرزش');
    expect(result.title).toContain('وەرزش');
    expect(result.confidence).toBe('medium');
  });

  it('parses daily repeat', () => {
    const result = parseNaturalLanguage('هەموو ڕۆژێک 7 بەیانی ڕۆیشتن');
    expect(result.repeatType).toBe('daily');
  });

  it('converts parsed to create input', () => {
    const parsed = parseNaturalLanguage('سبەی 8 خوێندن');
    const input = parsedToCreateInput(parsed);
    expect(input.title).toBeTruthy();
    expect(input.date).toBeTruthy();
  });
});

describe('Snooze Engine', () => {
  it('has all preset options', () => {
    expect(SNOOZE_PRESETS.length).toBe(8);
    expect(SNOOZE_PRESETS.map((p) => p.key)).toContain('15min');
    expect(SNOOZE_PRESETS.map((p) => p.key)).toContain('tomorrow');
  });

  it('adds 15 minutes correctly', () => {
    const from = new Date('2026-01-01T08:00:00');
    const result = addSnoozeDuration('15min', from);
    expect(result.time).toBe('08:15');
  });

  it('adds 1 hour correctly', () => {
    const from = new Date('2026-01-01T08:00:00');
    const result = addSnoozeDuration('1hour', from);
    expect(result.time).toBe('09:00');
  });
});

describe('Recurrence Engine', () => {
  it('generates daily dates', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'daily', undefined, 7);
    expect(dates.length).toBe(7);
    expect(dates[0]).toBe('2026-01-01');
    expect(dates[1]).toBe('2026-01-02');
  });

  it('generates weekly dates', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'weekly', undefined, 4);
    expect(dates.length).toBe(4);
    expect(dates[1]).toBe('2026-01-08');
  });

  it('generates monthly dates', () => {
    const dates = generateRecurrenceDates('2026-01-15', 'monthly', undefined, 3);
    expect(dates.length).toBe(3);
    expect(dates[1]).toBe('2026-02-15');
  });

  it('returns single date for none', () => {
    const dates = generateRecurrenceDates('2026-01-01', 'none', undefined, 5);
    expect(dates.length).toBe(1);
  });
});

describe('Date utilities', () => {
  it('groups plans by time period', () => {
    const { groupPlansByTime } = require('../src/utils/dates');
    const plans = [
      { id: '1', title: 'Morning', hasTime: true, time: '08:00' },
      { id: '2', title: 'Evening', hasTime: true, time: '20:00' },
      { id: '3', title: 'No time', hasTime: false },
    ];
    const groups = groupPlansByTime(plans);
    expect(groups.morning.length).toBe(1);
    expect(groups.afternoon.length).toBe(1);
    expect(groups.noTime.length).toBe(1);
  });
});
