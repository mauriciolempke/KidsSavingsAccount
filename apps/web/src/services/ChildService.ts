/**
 * Child Service
 * 
 * Handles child-related operations:
 * - Create/delete children
 * - Calculate totals excluding achieved goals
 * - Manage child data
 */

import { Child, Account } from '../domain/types';
import { ChildRepository, AccountRepository } from '../persistence/Repositories';
import { validateName } from '../domain/validation';
import { calculateChildTotalBalance } from '../domain/calc/BalanceCalculator';

// ============================================================================
// Child Service
// ============================================================================

export class ChildService {
  /**
   * Creates a new child.
   */
  public static async createChild(name: string, avatar: string = '👶'): Promise<Child> {
    validateName(name, 'Child name');
    return await ChildRepository.create(name, avatar);
  }

  /**
   * Gets a child by name.
   */
  public static async getChild(name: string): Promise<Child | null> {
    return await ChildRepository.get(name);
  }

  /**
   * Gets all children.
   */
  public static async getAllChildren(): Promise<Child[]> {
    return await ChildRepository.getAll();
  }

  /**
   * Deletes a child and all associated accounts.
   * This is a cascading delete operation.
   */
  public static async deleteChild(name: string): Promise<void> {
    await ChildRepository.delete(name);
  }

  /**
   * Gets the current balance for a child (excludes achieved goals).
   * This returns the CB (Current Balance) stored in the child entity.
   */
  public static async getChildBalance(name: string): Promise<number> {
    const child = await ChildRepository.get(name);
    return child?.cb || 0;
  }

  /**
   * Calculates the total balance for a child across all accounts.
   * Excludes achieved goals as per specification.
   */
  public static async calculateTotalBalance(name: string): Promise<number> {
    const accounts = await AccountRepository.getAllForChild(name);
    return calculateChildTotalBalance(accounts);
  }

  /**
   * Gets all accounts for a child.
   */
  public static async getAccounts(name: string): Promise<Account[]> {
    return await AccountRepository.getAllForChild(name);
  }

  /**
   * Gets summary information for a child.
   */
  public static async getChildSummary(name: string): Promise<ChildSummary> {
    const child = await ChildRepository.get(name);
    if (!child) {
      throw new Error(`Child not found: ${name}`);
    }

    const accounts = await this.getAccounts(name);
    const totalBalance = calculateChildTotalBalance(accounts);

    const activeAccounts = accounts.filter(a => !a.goal?.achieved);
    const achievedGoals = accounts.filter(a => a.goal?.achieved);

    return {
      name: child.name,
      avatar: child.avatar,
      totalBalance,
      accountCount: accounts.length,
      activeAccountCount: activeAccounts.length,
      achievedGoalCount: achievedGoals.length,
      lastCalculationTime: new Date(child.cbts),
    };
  }

  /**
   * Gets summaries for all children.
   */
  public static async getAllChildSummaries(): Promise<ChildSummary[]> {
    const children = await this.getAllChildren();
    const summaries: ChildSummary[] = [];

    for (const child of children) {
      try {
        const summary = await this.getChildSummary(child.name);
        summaries.push(summary);
      } catch (error) {
        console.error(`Error getting summary for child ${child.name}:`, error);
      }
    }

    return summaries;
  }

  /**
   * Checks if a child has any accounts.
   */
  public static async hasAccounts(name: string): Promise<boolean> {
    const accounts = await this.getAccounts(name);
    return accounts.length > 0;
  }

  /**
   * Gets the number of accounts for a child.
   */
  public static async getAccountCount(name: string): Promise<number> {
    const accounts = await this.getAccounts(name);
    return accounts.length;
  }

  /**
   * Updates a child's stored balance and timestamp.
   * This is typically called after balance calculation.
   */
  public static async updateBalance(
    name: string,
    balance: number,
    timestamp: number
  ): Promise<void> {
    await ChildRepository.updateBalance(name, balance, timestamp);
  }

  /**
   * Checks if a child exists.
   */
  public static async childExists(name: string): Promise<boolean> {
    const child = await ChildRepository.get(name);
    return child !== null;
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ChildSummary {
  name: string;
  avatar: string;
  totalBalance: number;
  accountCount: number;
  activeAccountCount: number;
  achievedGoalCount: number;
  lastCalculationTime: Date;
}

