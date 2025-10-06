/**
 * Schedule Utilities for Allowance and Interest Accrual
 * 
 * Handles weekly, bi-weekly, and monthly schedules.
 * All times are in local device time.
 * Monthly anchor is at 00:00 local time on the anchor day.
 */

import { Frequency, CONSTANTS } from '../types';

// ============================================================================
// Schedule Types
// ============================================================================

export interface ScheduleConfig {
  frequency: Frequency;
  anchorDate: Date; // The starting point for the schedule
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Strips time component from a Date, returning midnight (00:00:00.000) local time.
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Adds days to a date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Adds weeks to a date.
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Adds months to a date, preserving day of month where possible.
 * If the target month has fewer days, adjusts to the last day of that month.
 * 
 * Examples:
 * - addMonths(Jan 31, 1) → Feb 28/29 (last day of Feb)
 * - addMonths(Jan 15, 1) → Feb 15
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  
  // Try to set the target date
  result.setFullYear(targetYear);
  result.setMonth(normalizedMonth);
  
  // If day rolled over (e.g., Jan 31 → Mar 3), adjust to last day of target month
  if (result.getMonth() !== normalizedMonth) {
    result.setDate(0); // Go back to last day of previous month
  }
  
  return result;
}

/**
 * Calculates the number of periods between two dates based on frequency.
 * Returns the number of complete periods that have elapsed.
 */
export function calculatePeriodsBetween(
  startDate: Date,
  endDate: Date,
  frequency: Frequency
): number {
  const start = startOfDay(startDate).getTime();
  const end = startOfDay(endDate).getTime();
  
  if (end < start) return 0;
  
  switch (frequency) {
    case 'weekly':
      return Math.floor((end - start) / CONSTANTS.MS_PER_WEEK);
    
    case 'bi-weekly':
      return Math.floor((end - start) / (CONSTANTS.MS_PER_WEEK * 2));
    
    case 'monthly':
      // For monthly, we need to count actual month boundaries
      return calculateMonthsBetween(startDate, endDate);
    
    default:
      return 0;
  }
}

/**
 * Calculates the number of complete months between two dates.
 * A complete month means the anchor day has been reached in the target month.
 */
function calculateMonthsBetween(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  
  if (end < start) return 0;
  
  const anchorDay = start.getDate();
  let months = 0;
  let current = new Date(start);
  
  while (true) {
    current = addMonths(current, 1);
    
    // Check if the next period date is within or before the end date
    if (current.getTime() > end.getTime()) {
      break;
    }
    
    months++;
  }
  
  return months;
}

// ============================================================================
// Accrual Schedule Generation
// ============================================================================

/**
 * Generates all accrual dates between two timestamps for a given frequency.
 * Returns an array of timestamps (epoch ms) when accruals should occur.
 * 
 * @param lastAccrualTimestamp The timestamp of the last accrual (CBTS)
 * @param currentTimestamp The current timestamp
 * @param frequency The accrual frequency
 * @returns Array of timestamps when accruals are due
 */
export function generateAccrualDates(
  lastAccrualTimestamp: number,
  currentTimestamp: number,
  frequency: Frequency
): number[] {
  const lastAccrual = new Date(lastAccrualTimestamp);
  const now = new Date(currentTimestamp);
  
  const periods = calculatePeriodsBetween(lastAccrual, now, frequency);
  
  if (periods === 0) return [];
  
  const accrualDates: number[] = [];
  
  for (let i = 1; i <= periods; i++) {
    let nextDate: Date;
    
    switch (frequency) {
      case 'weekly':
        nextDate = addWeeks(lastAccrual, i);
        break;
      case 'bi-weekly':
        nextDate = addWeeks(lastAccrual, i * 2);
        break;
      case 'monthly':
        nextDate = addMonths(lastAccrual, i);
        break;
      default:
        continue;
    }
    
    // Set to midnight local time
    nextDate = startOfDay(nextDate);
    accrualDates.push(nextDate.getTime());
  }
  
  return accrualDates;
}

/**
 * Checks if an accrual is due for a given frequency.
 * Returns true if at least one period has elapsed.
 */
export function isAccrualDue(
  lastAccrualTimestamp: number,
  currentTimestamp: number,
  frequency: Frequency
): boolean {
  const periods = calculatePeriodsBetween(
    new Date(lastAccrualTimestamp),
    new Date(currentTimestamp),
    frequency
  );
  return periods > 0;
}

/**
 * Gets the next accrual date for a given frequency.
 * Returns null if current time is before the last accrual (clock skew).
 */
export function getNextAccrualDate(
  lastAccrualTimestamp: number,
  frequency: Frequency
): Date | null {
  const lastAccrual = new Date(lastAccrualTimestamp);
  const now = new Date();
  
  if (now.getTime() < lastAccrualTimestamp) {
    return null; // Clock skew detected
  }
  
  let nextDate: Date;
  
  switch (frequency) {
    case 'weekly':
      nextDate = addWeeks(lastAccrual, 1);
      break;
    case 'bi-weekly':
      nextDate = addWeeks(lastAccrual, 2);
      break;
    case 'monthly':
      nextDate = addMonths(lastAccrual, 1);
      break;
    default:
      return null;
  }
  
  return startOfDay(nextDate);
}

