/**
 * Account Service
 * 
 * Handles account-related operations:
 * - Create/delete accounts
 * - Goal achievement
 * - Read-only rules for achieved goals
 * - Account validation
 */

import { Account, AccountType, AllowanceConfig, InterestConfig, GoalConfig } from '../domain/types';
import { AccountRepository } from '../persistence/Repositories';
import { validateName, validatePositiveAmount } from '../domain/validation';
import { calculateAccountBalance, isGoalAchieved } from '../domain/calc/BalanceCalculator';

// ============================================================================
// Account Service
// ============================================================================

export class AccountService {
  /**
   * Creates a new account for a child.
   */
  public static async createAccount(
    childName: string,
    accountData: CreateAccountData
  ): Promise<Account> {
    validateName(accountData.name, 'Account name');

    // Validate goal data if provided
    if (accountData.type === 'Goal') {
      if (!accountData.goal) {
        throw new Error('Goal account must have goal configuration');
      }
      validateName(accountData.goal.name, 'Goal name');
      validatePositiveAmount(accountData.goal.cost, 'Goal cost');
    }

    // Validate allowance
    if (accountData.allowance?.enabled) {
      if (!accountData.allowance.amount || !accountData.allowance.frequency) {
        throw new Error('Allowance requires amount and frequency');
      }
      validatePositiveAmount(accountData.allowance.amount, 'Allowance amount');
    }

    // Validate interest
    if (accountData.interest?.enabled) {
      if (!accountData.interest.type || accountData.interest.value === undefined || !accountData.interest.frequency) {
        throw new Error('Interest requires type, value, and frequency');
      }
      validatePositiveAmount(accountData.interest.value, 'Interest value');
    }

    // Create account entity
    const account: Account = {
      name: accountData.name,
      type: accountData.type,
      allowance: accountData.allowance || { enabled: false },
      interest: accountData.interest || { enabled: false },
      goal: accountData.goal ? { ...accountData.goal, achieved: false } : undefined,
      ledger: [],
      createdAt: Date.now(),
    };

    // Save account
    return await AccountRepository.create(childName, account);
  }

  /**
   * Gets an account.
   */
  public static async getAccount(childName: string, accountName: string): Promise<Account | null> {
    return await AccountRepository.get(childName, accountName);
  }

  /**
   * Gets all accounts for a child.
   */
  public static async getAllAccounts(childName: string): Promise<Account[]> {
    return await AccountRepository.getAllForChild(childName);
  }

  /**
   * Deletes an account.
   * Checks if account is a goal that's achieved - requires confirmation.
   */
  public static async deleteAccount(
    childName: string,
    accountName: string,
    confirmIfAchieved: boolean = false
  ): Promise<void> {
    const account = await this.getAccount(childName, accountName);
    
    if (account?.goal?.achieved && !confirmIfAchieved) {
      throw new Error('Cannot delete achieved goal without confirmation');
    }

    await AccountRepository.delete(childName, accountName);
  }

  /**
   * Gets the current balance of an account.
   */
  public static async getAccountBalance(childName: string, accountName: string): Promise<number> {
    const account = await this.getAccount(childName, accountName);
    if (!account) {
      throw new Error('Account not found');
    }
    return calculateAccountBalance(account);
  }

  /**
   * Checks if an account is read-only (achieved goal).
   */
  public static async isReadOnly(childName: string, accountName: string): Promise<boolean> {
    const account = await this.getAccount(childName, accountName);
    return account?.goal?.achieved || false;
  }

  /**
   * Marks a goal as achieved.
   * Makes the account read-only.
   */
  public static async markGoalAchieved(childName: string, accountName: string): Promise<void> {
    const account = await this.getAccount(childName, accountName);
    
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.type !== 'Goal') {
      throw new Error('Only Goal accounts can be marked as achieved');
    }

    if (!account.goal) {
      throw new Error('Account does not have goal configuration');
    }

    if (account.goal.achieved) {
      throw new Error('Goal is already achieved');
    }

    // Check if goal is actually achieved (balance >= cost)
    const balance = calculateAccountBalance(account);
    if (balance < account.goal.cost) {
      throw new Error(`Goal not yet achieved. Current: $${balance}, Target: $${account.goal.cost}`);
    }

    // Mark as achieved
    account.goal.achieved = true;
    await AccountRepository.save(childName, account);
  }

  /**
   * Checks if a goal should be auto-marked as achieved.
   * Returns true if balance >= cost and goal is not yet marked achieved.
   */
  public static async shouldAutoMarkAchieved(childName: string, accountName: string): Promise<boolean> {
    const account = await this.getAccount(childName, accountName);
    
    if (!account || account.type !== 'Goal' || !account.goal) {
      return false;
    }

    if (account.goal.achieved) {
      return false;
    }

    return isGoalAchieved(account);
  }

  /**
   * Gets account summary information.
   */
  public static async getAccountSummary(childName: string, accountName: string): Promise<AccountSummary> {
    const account = await this.getAccount(childName, accountName);
    
    if (!account) {
      throw new Error('Account not found');
    }

    const balance = calculateAccountBalance(account);
    const isReadOnly = account.goal?.achieved || false;
    const transactionCount = account.ledger.length;

    const summary: AccountSummary = {
      name: account.name,
      type: account.type,
      balance,
      isReadOnly,
      transactionCount,
      hasAllowance: account.allowance.enabled,
      hasInterest: account.interest.enabled,
      createdAt: account.createdAt,
    };

    if (account.goal) {
      summary.goal = {
        name: account.goal.name,
        cost: account.goal.cost,
        achieved: account.goal.achieved,
        progress: Math.min(100, (balance / account.goal.cost) * 100),
      };
    }

    return summary;
  }

  /**
   * Checks if an account exists.
   */
  public static async accountExists(childName: string, accountName: string): Promise<boolean> {
    return await AccountRepository.exists(childName, accountName);
  }

  /**
   * Updates an account configuration (allowance, interest).
   * Cannot update if account is read-only (achieved goal).
   */
  public static async updateConfiguration(
    childName: string,
    accountName: string,
    updates: AccountConfigUpdate
  ): Promise<void> {
    const account = await this.getAccount(childName, accountName);
    
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.goal?.achieved) {
      throw new Error('Cannot update achieved goal account');
    }

    if (updates.allowance !== undefined) {
      account.allowance = updates.allowance;
    }

    if (updates.interest !== undefined) {
      account.interest = updates.interest;
    }

    await AccountRepository.save(childName, account);
  }
}

// ============================================================================
// Types
// ============================================================================

export interface CreateAccountData {
  name: string;
  type: AccountType;
  allowance?: AllowanceConfig;
  interest?: InterestConfig;
  goal?: Omit<GoalConfig, 'achieved'>; // Goal without achieved flag (always starts false)
}

export interface AccountSummary {
  name: string;
  type: AccountType;
  balance: number;
  isReadOnly: boolean;
  transactionCount: number;
  hasAllowance: boolean;
  hasInterest: boolean;
  createdAt?: number;
  goal?: {
    name: string;
    cost: number;
    achieved: boolean;
    progress: number; // Percentage (0-100)
  };
}

export interface AccountConfigUpdate {
  allowance?: AllowanceConfig;
  interest?: InterestConfig;
}

