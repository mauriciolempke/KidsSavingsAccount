/**
 * Balance Calculation Service
 * 
 * Orchestrates balance calculations across all accounts:
 * - Iterates through all children and their accounts
 * - Applies allowance and interest schedules
 * - Updates ledgers and child balances
 * - Detects clock skew
 */

import { Account } from '../domain/types';
import { ChildRepository, AccountRepository } from '../persistence/Repositories';
import { BalanceCalculator, calculateChildTotalBalance } from '../domain/calc/BalanceCalculator';
import { LedgerService } from './LedgerService';

// ============================================================================
// Balance Calculation Service
// ============================================================================

export class BalanceCalculationService {
  /**
   * Runs balance calculation for all children and their accounts.
   * This should be called on app startup and after balance-affecting actions.
   */
  public static async calculateAll(): Promise<CalculationSummary> {
    const startTime = Date.now();
    const results: ChildCalculationResult[] = [];
    const errors: string[] = [];

    try {
      const children = await ChildRepository.getAll();

      for (const child of children) {
        try {
          const result = await this.calculateForChild(child.name);
          results.push(result);
        } catch (error) {
          const errorMsg = `Error calculating for child ${child.name}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      return {
        success: true,
        childrenProcessed: results.length,
        totalAccruals: results.reduce((sum, r) => sum + r.totalAccruals, 0),
        totalAccruedAmount: results.reduce((sum, r) => sum + r.totalAccruedAmount, 0),
        duration,
        errors,
        results,
      };
    } catch (error) {
      console.error('Balance calculation failed:', error);
      return {
        success: false,
        childrenProcessed: results.length,
        totalAccruals: 0,
        totalAccruedAmount: 0,
        duration: Date.now() - startTime,
        errors: [...errors, `Fatal error: ${error}`],
        results,
      };
    }
  }

  /**
   * Runs balance calculation for a specific child and all their accounts.
   */
  public static async calculateForChild(childName: string): Promise<ChildCalculationResult> {
    const child = await ChildRepository.get(childName);
    if (!child) {
      throw new Error(`Child not found: ${childName}`);
    }

    // Check for clock skew
    const now = Date.now();
    if (now < child.cbts) {
      return {
        childName,
        clockSkewDetected: true,
        accountsProcessed: 0,
        totalAccruals: 0,
        totalAccruedAmount: 0,
        newBalance: child.cb,
      };
    }

    const accounts = await AccountRepository.getAllForChild(childName);
    let totalAccruals = 0;
    let totalAccruedAmount = 0;

    // Process each account
    for (const account of accounts) {
      try {
        const result = BalanceCalculator.calculate(account, child.cbts, now);

        // Append new ledger entries
        if (result.ledgerEntries.length > 0) {
          await LedgerService.appendEntries(childName, account.name, result.ledgerEntries);
        }

        totalAccruals += result.accruals.length;
        totalAccruedAmount += result.accruals.reduce((sum, a) => sum + a.amount, 0);
      } catch (error) {
        console.error(`Error calculating account ${childName}/${account.name}:`, error);
      }
    }

    // Recalculate child's total balance (excluding achieved goals)
    const updatedAccounts = await AccountRepository.getAllForChild(childName);
    const newBalance = calculateChildTotalBalance(updatedAccounts);

    // Update child's CB and CBTS
    await ChildRepository.updateBalance(childName, newBalance, now);

    return {
      childName,
      clockSkewDetected: false,
      accountsProcessed: accounts.length,
      totalAccruals,
      totalAccruedAmount,
      newBalance,
    };
  }

  /**
   * Runs balance calculation for a specific account.
   * Updates the account's ledger but does not update child totals.
   */
  public static async calculateForAccount(
    childName: string,
    accountName: string
  ): Promise<AccountCalculationResult> {
    const child = await ChildRepository.get(childName);
    if (!child) {
      throw new Error(`Child not found: ${childName}`);
    }

    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error(`Account not found: ${childName}/${accountName}`);
    }

    const now = Date.now();

    // Check for clock skew
    if (now < child.cbts) {
      return {
        accountName,
        clockSkewDetected: true,
        accruals: 0,
        accruedAmount: 0,
        newBalance: await LedgerService.getLedgerStats(childName, accountName).then(s => s.totalDeposits - s.totalWithdrawals),
      };
    }

    const result = BalanceCalculator.calculate(account, child.cbts, now);

    // Append new ledger entries
    if (result.ledgerEntries.length > 0) {
      await LedgerService.appendEntries(childName, account.name, result.ledgerEntries);
    }

    return {
      accountName,
      clockSkewDetected: false,
      accruals: result.accruals.length,
      accruedAmount: result.accruals.reduce((sum, a) => sum + a.amount, 0),
      newBalance: result.newBalance,
    };
  }

  /**
   * Checks if balance calculation is needed for a child.
   * Returns true if at least one accrual period has elapsed.
   */
  public static async isCalculationNeeded(childName: string): Promise<boolean> {
    const child = await ChildRepository.get(childName);
    if (!child) return false;

    const now = Date.now();
    if (now < child.cbts) return false; // Clock skew

    const accounts = await AccountRepository.getAllForChild(childName);

    for (const account of accounts) {
      if (account.goal?.achieved) continue; // Skip achieved goals

      // Check if any accruals are due
      if (account.allowance.enabled || account.interest.enabled) {
        // For simplicity, assume calculation is needed if more than 1 day has passed
        if (now - child.cbts > 24 * 60 * 60 * 1000) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Gets the last calculation timestamp for a child.
   */
  public static async getLastCalculationTime(childName: string): Promise<Date | null> {
    const child = await ChildRepository.get(childName);
    return child ? new Date(child.cbts) : null;
  }
}

// ============================================================================
// Types
// ============================================================================

export interface CalculationSummary {
  success: boolean;
  childrenProcessed: number;
  totalAccruals: number;
  totalAccruedAmount: number;
  duration: number; // milliseconds
  errors: string[];
  results: ChildCalculationResult[];
}

export interface ChildCalculationResult {
  childName: string;
  clockSkewDetected: boolean;
  accountsProcessed: number;
  totalAccruals: number;
  totalAccruedAmount: number;
  newBalance: number;
}

export interface AccountCalculationResult {
  accountName: string;
  clockSkewDetected: boolean;
  accruals: number;
  accruedAmount: number;
  newBalance: number;
}

