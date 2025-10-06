/**
 * Balance Calculator
 * 
 * Handles the calculation of allowance and interest accruals.
 * 
 * Key Rules:
 * 1. Interest is calculated BEFORE allowance when both are due on the same period
 * 2. Percentage interest uses the balance at the END of the period
 * 3. All amounts are rounded UP to the nearest dollar
 * 4. Achieved Goal accounts are EXCLUDED from calculations
 * 5. Process accruals chronologically by period
 */

import {
  Account,
  AllowanceConfig,
  InterestConfig,
  LedgerEntry,
  BalanceCalculationResult,
  AccrualEntry,
  CONSTANTS,
} from '../types';
import { roundUp, calculateInterest } from './round';
import { generateAccrualDates } from './schedule';

// ============================================================================
// Balance Calculator
// ============================================================================

export class BalanceCalculator {
  /**
   * Calculates new balance and generates ledger entries for due accruals.
   * 
   * @param account The account to calculate
   * @param lastCalculationTimestamp The CBTS (last calculation timestamp)
   * @param currentTimestamp The current time
   * @returns Calculation result with new balance, timestamp, and entries
   */
  public static calculate(
    account: Account,
    lastCalculationTimestamp: number,
    currentTimestamp: number
  ): BalanceCalculationResult {
    // Skip if goal is achieved (read-only)
    if (account.goal?.achieved) {
      return {
        newBalance: this.calculateCurrentBalance(account),
        newTimestamp: lastCalculationTimestamp, // Don't update CBTS
        accruals: [],
        ledgerEntries: [],
      };
    }

    // Check for clock skew
    if (currentTimestamp < lastCalculationTimestamp) {
      return {
        newBalance: this.calculateCurrentBalance(account),
        newTimestamp: lastCalculationTimestamp,
        accruals: [],
        ledgerEntries: [],
      };
    }

    const accruals: AccrualEntry[] = [];
    const ledgerEntries: LedgerEntry[] = [];
    
    // Get all accrual periods
    const periods = this.collectAccrualPeriods(
      account,
      lastCalculationTimestamp,
      currentTimestamp
    );

    // Process each period chronologically
    let runningBalance = this.calculateCurrentBalance(account);

    for (const period of periods) {
      // Apply interest first (if due in this period)
      if (period.interestDue && account.interest.enabled) {
        const interestAmount = this.calculateInterestForPeriod(
          runningBalance,
          account.interest
        );

        if (interestAmount > 0) {
          const accrual: AccrualEntry = {
            timestamp: period.timestamp,
            accountName: account.name,
            type: 'interest',
            amount: interestAmount,
            description: this.formatInterestDescription(account.interest),
          };
          accruals.push(accrual);

          const ledgerEntry: LedgerEntry = {
            timestamp: period.timestamp,
            type: 'Deposit',
            description: accrual.description,
            value: interestAmount,
          };
          ledgerEntries.push(ledgerEntry);

          runningBalance += interestAmount;
        }
      }

      // Then apply allowance (if due in this period)
      if (period.allowanceDue && account.allowance.enabled) {
        const allowanceAmount = account.allowance.amount || 0;

        if (allowanceAmount > 0) {
          const accrual: AccrualEntry = {
            timestamp: period.timestamp,
            accountName: account.name,
            type: 'allowance',
            amount: allowanceAmount,
            description: this.formatAllowanceDescription(account.allowance),
          };
          accruals.push(accrual);

          const ledgerEntry: LedgerEntry = {
            timestamp: period.timestamp,
            type: 'Deposit',
            description: accrual.description,
            value: allowanceAmount,
          };
          ledgerEntries.push(ledgerEntry);

          runningBalance += allowanceAmount;
        }
      }
    }

    // New CBTS is the current timestamp
    const newTimestamp = currentTimestamp;

    return {
      newBalance: runningBalance,
      newTimestamp,
      accruals,
      ledgerEntries,
    };
  }

  /**
   * Calculates the current balance from ledger entries.
   * Does not include pending accruals.
   */
  private static calculateCurrentBalance(account: Account): number {
    const balance = account.ledger.reduce((sum, entry) => sum + entry.value, 0);
    return Math.max(CONSTANTS.MIN_BALANCE, balance);
  }

  /**
   * Collects all accrual periods between two timestamps.
   * Combines allowance and interest schedules.
   */
  private static collectAccrualPeriods(
    account: Account,
    startTimestamp: number,
    endTimestamp: number
  ): AccrualPeriod[] {
    const periods = new Map<number, AccrualPeriod>();

    // Collect allowance periods
    if (account.allowance.enabled && account.allowance.frequency) {
      const allowanceDates = generateAccrualDates(
        startTimestamp,
        endTimestamp,
        account.allowance.frequency
      );

      for (const timestamp of allowanceDates) {
        const period = periods.get(timestamp) || {
          timestamp,
          allowanceDue: false,
          interestDue: false,
        };
        period.allowanceDue = true;
        periods.set(timestamp, period);
      }
    }

    // Collect interest periods
    if (account.interest.enabled && account.interest.frequency) {
      const interestDates = generateAccrualDates(
        startTimestamp,
        endTimestamp,
        account.interest.frequency
      );

      for (const timestamp of interestDates) {
        const period = periods.get(timestamp) || {
          timestamp,
          allowanceDue: false,
          interestDue: false,
        };
        period.interestDue = true;
        periods.set(timestamp, period);
      }
    }

    // Sort periods chronologically
    return Array.from(periods.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Calculates interest for a period based on configuration.
   */
  private static calculateInterestForPeriod(
    balance: number,
    config: InterestConfig
  ): number {
    if (!config.enabled || config.value === undefined) return 0;

    if (config.type === 'Percentage') {
      // Percentage interest: use end-of-period balance
      return calculateInterest(balance, config.value);
    } else {
      // Absolute interest: fixed amount
      return roundUp(config.value);
    }
  }

  /**
   * Formats a description for interest accrual.
   */
  private static formatInterestDescription(config: InterestConfig): string {
    if (config.type === 'Percentage') {
      return `Interest ${config.value}% (${config.frequency})`;
    } else {
      return `Interest $${config.value} (${config.frequency})`;
    }
  }

  /**
   * Formats a description for allowance accrual.
   */
  private static formatAllowanceDescription(config: AllowanceConfig): string {
    return `Allowance $${config.amount} (${config.frequency})`;
  }
}

// ============================================================================
// Helper Types
// ============================================================================

interface AccrualPeriod {
  timestamp: number;
  allowanceDue: boolean;
  interestDue: boolean;
}

// ============================================================================
// Exported Helper Functions
// ============================================================================

/**
 * Calculates the total balance for a child across all non-achieved accounts.
 */
export function calculateChildTotalBalance(accounts: Account[]): number {
  return accounts
    .filter(account => !account.goal?.achieved) // Exclude achieved goals
    .reduce((total, account) => {
      const balance = account.ledger.reduce((sum, entry) => sum + entry.value, 0);
      return total + Math.max(0, balance);
    }, 0);
}

/**
 * Calculates the current balance of a single account.
 */
export function calculateAccountBalance(account: Account): number {
  const balance = account.ledger.reduce((sum, entry) => sum + entry.value, 0);
  return Math.max(CONSTANTS.MIN_BALANCE, balance);
}

/**
 * Checks if a goal has been achieved based on current balance.
 */
export function isGoalAchieved(account: Account): boolean {
  if (account.type !== 'Goal' || !account.goal) return false;
  const balance = calculateAccountBalance(account);
  return balance >= account.goal.cost;
}

