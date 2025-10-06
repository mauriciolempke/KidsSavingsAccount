/**
 * Transfer Service
 * 
 * Handles transfers between accounts:
 * - Validates transfer requests
 * - Caps amount to available balance
 * - Creates withdraw/deposit entries
 * - Provides toast notifications for capping
 */

import { AccountRepository } from '../persistence/Repositories';
import { LedgerService } from './LedgerService';
import { calculateAccountBalance } from '../domain/calc/BalanceCalculator';
import { validatePositiveAmount } from '../domain/validation';

// ============================================================================
// Transfer Service
// ============================================================================

export class TransferService {
  /**
   * Transfers funds from one account to another.
   * Caps the amount to available balance if necessary.
   * Returns result with toast message if capped.
   */
  public static async transfer(
    childName: string,
    fromAccountName: string,
    toAccountName: string,
    requestedAmount: number
  ): Promise<TransferResult> {
    // Validate amount
    validatePositiveAmount(requestedAmount, 'Transfer amount');

    // Validate accounts exist
    const fromAccount = await AccountRepository.get(childName, fromAccountName);
    const toAccount = await AccountRepository.get(childName, toAccountName);

    if (!fromAccount) {
      throw new Error(`Source account not found: ${fromAccountName}`);
    }

    if (!toAccount) {
      throw new Error(`Destination account not found: ${toAccountName}`);
    }

    // Check for same account transfer
    if (fromAccountName.toLowerCase() === toAccountName.toLowerCase()) {
      throw new Error('Cannot transfer to the same account');
    }

    // Check if source account is read-only
    if (fromAccount.goal?.achieved) {
      throw new Error('Cannot transfer from achieved goal account (read-only)');
    }

    // Check if destination account is read-only
    if (toAccount.goal?.achieved) {
      throw new Error('Cannot transfer to achieved goal account (read-only)');
    }

    // Calculate available balance
    const availableBalance = calculateAccountBalance(fromAccount);

    if (availableBalance === 0) {
      throw new Error('Insufficient funds for transfer');
    }

    // Cap amount to available balance
    const actualAmount = Math.min(requestedAmount, availableBalance);
    const wasCapped = actualAmount < requestedAmount;

    // Perform withdrawal from source
    const withdrawDescription = `Transfer to ${toAccount.name}`;
    const withdrawResult = await LedgerService.withdraw(
      childName,
      fromAccountName,
      actualAmount,
      withdrawDescription
    );

    // Perform deposit to destination
    const depositDescription = `Transfer from ${fromAccount.name}`;
    const depositEntry = await LedgerService.deposit(
      childName,
      toAccountName,
      actualAmount,
      depositDescription
    );

    // Build result
    const result: TransferResult = {
      success: true,
      fromAccount: fromAccountName,
      toAccount: toAccountName,
      requestedAmount,
      actualAmount,
      wasCapped,
      withdrawEntry: withdrawResult.entry,
      depositEntry,
      toastMessage: wasCapped 
        ? `Transfer amount adjusted to available balance ($${actualAmount})` 
        : undefined,
    };

    return result;
  }

  /**
   * Validates a transfer request without executing it.
   * Returns validation result with any issues.
   */
  public static async validateTransfer(
    childName: string,
    fromAccountName: string,
    toAccountName: string,
    amount: number
  ): Promise<TransferValidation> {
    const issues: string[] = [];

    // Validate amount
    try {
      validatePositiveAmount(amount, 'Transfer amount');
    } catch (error) {
      issues.push(error instanceof Error ? error.message : 'Invalid amount');
    }

    // Check same account
    if (fromAccountName.toLowerCase() === toAccountName.toLowerCase()) {
      issues.push('Cannot transfer to the same account');
    }

    // Check accounts exist
    const fromAccount = await AccountRepository.get(childName, fromAccountName);
    const toAccount = await AccountRepository.get(childName, toAccountName);

    if (!fromAccount) {
      issues.push(`Source account "${fromAccountName}" not found`);
    }

    if (!toAccount) {
      issues.push(`Destination account "${toAccountName}" not found`);
    }

    if (!fromAccount || !toAccount) {
      return {
        isValid: false,
        issues,
        maxAmount: 0,
        willBeCapped: false,
      };
    }

    // Check read-only
    if (fromAccount.goal?.achieved) {
      issues.push('Source account is achieved goal (read-only)');
    }

    if (toAccount.goal?.achieved) {
      issues.push('Destination account is achieved goal (read-only)');
    }

    // Check available balance
    const availableBalance = calculateAccountBalance(fromAccount);

    if (availableBalance === 0) {
      issues.push('Insufficient funds in source account');
    }

    const willBeCapped = amount > availableBalance;

    return {
      isValid: issues.length === 0,
      issues,
      maxAmount: availableBalance,
      willBeCapped,
    };
  }

  /**
   * Gets the maximum transferable amount from an account.
   */
  public static async getMaxTransferAmount(
    childName: string,
    accountName: string
  ): Promise<number> {
    const account = await AccountRepository.get(childName, accountName);
    if (!account) return 0;

    if (account.goal?.achieved) return 0; // Read-only

    return calculateAccountBalance(account);
  }

  /**
   * Checks if a transfer is possible between two accounts.
   */
  public static async canTransfer(
    childName: string,
    fromAccountName: string,
    toAccountName: string
  ): Promise<boolean> {
    const validation = await this.validateTransfer(childName, fromAccountName, toAccountName, 1);
    return validation.isValid || validation.issues.every(issue => 
      issue.includes('Insufficient funds') || issue.includes('amount')
    );
  }
}

// ============================================================================
// Types
// ============================================================================

export interface TransferResult {
  success: boolean;
  fromAccount: string;
  toAccount: string;
  requestedAmount: number;
  actualAmount: number;
  wasCapped: boolean;
  withdrawEntry: any; // LedgerEntry
  depositEntry: any; // LedgerEntry
  toastMessage?: string;
}

export interface TransferValidation {
  isValid: boolean;
  issues: string[];
  maxAmount: number;
  willBeCapped: boolean;
}

