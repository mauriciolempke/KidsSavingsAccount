/**
 * Ledger Service
 * 
 * Handles ledger operations:
 * - Append deposit/withdraw entries
 * - Maintain chronological ordering
 * - Recompute balance and timestamp after changes
 */

import { Account, LedgerEntry, TransactionType } from '../domain/types';
import { AccountRepository } from '../persistence/Repositories';
import { validateDescription, validatePositiveAmount } from '../domain/validation';
import { calculateAccountBalance } from '../domain/calc/BalanceCalculator';

// ============================================================================
// Ledger Service
// ============================================================================

export class LedgerService {
  /**
   * Appends a deposit entry to the ledger.
   */
  public static async deposit(
    childName: string,
    accountName: string,
    amount: number,
    description: string
  ): Promise<LedgerEntry> {
    validatePositiveAmount(amount, 'Deposit amount');
    validateDescription(description);

    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if account is read-only
    if (account.goal?.achieved) {
      throw new Error('Cannot deposit to achieved goal account (read-only)');
    }

    // Create ledger entry
    const entry: LedgerEntry = {
      timestamp: Date.now(),
      type: 'Deposit',
      description,
      value: amount,
    };

    // Append to ledger (maintains chronological order)
    account.ledger.push(entry);

    // Save account
    await AccountRepository.save(childName, account);

    return entry;
  }

  /**
   * Appends a withdraw entry to the ledger.
   * Amount is automatically capped to available balance.
   * Returns the actual withdrawn amount (may be less than requested).
   */
  public static async withdraw(
    childName: string,
    accountName: string,
    requestedAmount: number,
    description: string
  ): Promise<WithdrawResult> {
    validatePositiveAmount(requestedAmount, 'Withdraw amount');
    validateDescription(description);

    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if account is read-only
    if (account.goal?.achieved) {
      throw new Error('Cannot withdraw from achieved goal account (read-only)');
    }

    // Calculate current balance
    const currentBalance = calculateAccountBalance(account);

    // Cap withdrawal to available balance
    const actualAmount = Math.min(requestedAmount, currentBalance);
    const wasCapped = actualAmount < requestedAmount;

    // Create ledger entry (negative value for withdrawal)
    const entry: LedgerEntry = {
      timestamp: Date.now(),
      type: 'Withdraw',
      description,
      value: -actualAmount,
    };

    // Append to ledger
    account.ledger.push(entry);

    // Save account
    await AccountRepository.save(childName, account);

    return {
      entry,
      actualAmount,
      requestedAmount,
      wasCapped,
      cappedMessage: wasCapped 
        ? `Withdrawal amount adjusted to available balance ($${actualAmount})` 
        : undefined,
    };
  }

  /**
   * Gets the ledger for an account.
   * Returns entries in chronological order (oldest first).
   */
  public static async getLedger(childName: string, accountName: string): Promise<LedgerEntry[]> {
    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }

    return account.ledger;
  }

  /**
   * Gets the ledger for an account in reverse chronological order (newest first).
   * This is the typical display order in the UI.
   */
  public static async getLedgerReversed(childName: string, accountName: string): Promise<LedgerEntry[]> {
    const ledger = await this.getLedger(childName, accountName);
    return [...ledger].reverse();
  }

  /**
   * Gets recent ledger entries (last N entries).
   * Returns in reverse chronological order (newest first).
   */
  public static async getRecentEntries(
    childName: string,
    accountName: string,
    count: number = 10
  ): Promise<LedgerEntry[]> {
    const ledger = await this.getLedgerReversed(childName, accountName);
    return ledger.slice(0, count);
  }

  /**
   * Gets ledger entries within a date range.
   */
  public static async getEntriesByDateRange(
    childName: string,
    accountName: string,
    startDate: Date,
    endDate: Date
  ): Promise<LedgerEntry[]> {
    const ledger = await this.getLedger(childName, accountName);
    
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return ledger.filter(entry => 
      entry.timestamp >= startTime && entry.timestamp <= endTime
    );
  }

  /**
   * Appends a ledger entry directly (used by balance calculation service).
   * Does not validate read-only status.
   */
  public static async appendEntry(
    childName: string,
    accountName: string,
    entry: LedgerEntry
  ): Promise<void> {
    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }

    account.ledger.push(entry);
    await AccountRepository.save(childName, account);
  }

  /**
   * Appends multiple ledger entries (used by balance calculation).
   * Maintains chronological order.
   */
  public static async appendEntries(
    childName: string,
    accountName: string,
    entries: LedgerEntry[]
  ): Promise<void> {
    if (entries.length === 0) return;

    const account = await AccountRepository.get(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }

    // Append all entries
    account.ledger.push(...entries);

    // Sort by timestamp to maintain chronological order
    account.ledger.sort((a, b) => a.timestamp - b.timestamp);

    await AccountRepository.save(childName, account);
  }

  /**
   * Gets ledger statistics.
   */
  public static async getLedgerStats(childName: string, accountName: string): Promise<LedgerStats> {
    const ledger = await this.getLedger(childName, accountName);

    let totalDeposits = 0;
    let totalWithdrawals = 0;
    let depositCount = 0;
    let withdrawCount = 0;

    for (const entry of ledger) {
      if (entry.type === 'Deposit') {
        totalDeposits += entry.value;
        depositCount++;
      } else {
        totalWithdrawals += Math.abs(entry.value);
        withdrawCount++;
      }
    }

    const firstEntry = ledger.length > 0 ? ledger[0] : null;
    const lastEntry = ledger.length > 0 ? ledger[ledger.length - 1] : null;

    return {
      totalEntries: ledger.length,
      totalDeposits,
      totalWithdrawals,
      depositCount,
      withdrawCount,
      firstEntryDate: firstEntry ? new Date(firstEntry.timestamp) : null,
      lastEntryDate: lastEntry ? new Date(lastEntry.timestamp) : null,
    };
  }
}

// ============================================================================
// Types
// ============================================================================

export interface WithdrawResult {
  entry: LedgerEntry;
  actualAmount: number;
  requestedAmount: number;
  wasCapped: boolean;
  cappedMessage?: string;
}

export interface LedgerStats {
  totalEntries: number;
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawCount: number;
  firstEntryDate: Date | null;
  lastEntryDate: Date | null;
}

