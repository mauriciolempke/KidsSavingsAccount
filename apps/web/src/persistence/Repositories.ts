/**
 * Repositories
 * 
 * Provides high-level access to Parent, Child, and Account entities.
 * Handles file naming, serialization, and references between entities.
 */

import { Parent, Child, Account, CONSTANTS, buildChildFilename, buildAccountFilename } from '../domain/types';
import { LocalFileStore } from './LocalFileStore';
import { validateName, validateUniqueName, normalizeName } from '../domain/validation';

// ============================================================================
// Parent Repository
// ============================================================================

export class ParentRepository {
  private static readonly FILENAME = CONSTANTS.PARENT_FILE;

  /**
   * Gets the parent entity.
   * Returns null if parent doesn't exist (first-time user).
   */
  public static async get(): Promise<Parent | null> {
    try {
      const content = await LocalFileStore.getFile(this.FILENAME);
      if (!content) return null;

      const parent = JSON.parse(content) as Parent;
      return parent;
    } catch (error) {
      console.error('Error loading parent:', error);
      return null;
    }
  }

  /**
   * Creates or updates the parent entity.
   */
  public static async save(parent: Parent): Promise<void> {
    try {
      validateName(parent.name, 'Parent name');
      
      const content = JSON.stringify(parent, null, 2);
      await LocalFileStore.putFile(this.FILENAME, content);
    } catch (error) {
      console.error('Error saving parent:', error);
      throw new Error('Failed to save parent');
    }
  }

  /**
   * Creates a new parent (first-time setup).
   */
  public static async create(name: string): Promise<Parent> {
    validateName(name, 'Parent name');

    const parent: Parent = {
      name,
      children: [],
    };

    await this.save(parent);
    return parent;
  }

  /**
   * Checks if parent exists.
   */
  public static async exists(): Promise<boolean> {
    return await LocalFileStore.fileExists(this.FILENAME);
  }

  /**
   * Adds a child reference to the parent.
   */
  public static async addChild(childName: string): Promise<void> {
    const parent = await this.get();
    if (!parent) throw new Error('Parent not found');

    const normalizedName = normalizeName(childName);
    
    // Check if child already exists
    if (parent.children.some(c => normalizeName(c) === normalizedName)) {
      throw new Error('Child already exists');
    }

    parent.children.push(childName.toLowerCase());
    await this.save(parent);
  }

  /**
   * Removes a child reference from the parent.
   */
  public static async removeChild(childName: string): Promise<void> {
    const parent = await this.get();
    if (!parent) throw new Error('Parent not found');

    const normalizedName = normalizeName(childName);
    parent.children = parent.children.filter(c => normalizeName(c) !== normalizedName);
    
    await this.save(parent);
  }

  /**
   * Deletes the parent (use with caution).
   */
  public static async delete(): Promise<void> {
    await LocalFileStore.deleteFile(this.FILENAME);
  }
}

// ============================================================================
// Child Repository
// ============================================================================

export class ChildRepository {
  /**
   * Gets a child by name.
   */
  public static async get(name: string): Promise<Child | null> {
    try {
      const filename = buildChildFilename(name);
      const content = await LocalFileStore.getFile(filename);
      if (!content) return null;

      const child = JSON.parse(content) as Child;
      
      // Migration: Add default avatar if missing (for existing children)
      if (!child.avatar) {
        child.avatar = '👶';
        // Save the updated child with avatar
        await this.save(child);
      }
      
      return child;
    } catch (error) {
      console.error(`Error loading child ${name}:`, error);
      return null;
    }
  }

  /**
   * Saves a child entity.
   */
  public static async save(child: Child): Promise<void> {
    try {
      validateName(child.name, 'Child name');
      
      const filename = buildChildFilename(child.name);
      const content = JSON.stringify(child, null, 2);
      await LocalFileStore.putFile(filename, content);
    } catch (error) {
      console.error(`Error saving child ${child.name}:`, error);
      throw new Error(`Failed to save child: ${child.name}`);
    }
  }

  /**
   * Creates a new child.
   */
  public static async create(name: string, avatar: string = '👶'): Promise<Child> {
    // Validate name
    validateName(name, 'Child name');

    // Check uniqueness
    const parent = await ParentRepository.get();
    if (parent) {
      validateUniqueName(name, parent.children, 'child');
    }

    const child: Child = {
      name,
      avatar,
      accounts: [],
      cb: 0,
      cbts: Date.now(),
    };

    await this.save(child);
    
    // Add to parent
    await ParentRepository.addChild(name);

    return child;
  }

  /**
   * Deletes a child and all associated accounts.
   * Removes child reference from parent.
   */
  public static async delete(name: string): Promise<void> {
    try {
      const child = await this.get(name);
      if (!child) return;

      // Delete all associated accounts
      for (const accountName of child.accounts) {
        await AccountRepository.delete(name, accountName);
      }

      // Delete child file
      const filename = buildChildFilename(name);
      await LocalFileStore.deleteFile(filename);

      // Remove from parent
      await ParentRepository.removeChild(name);
    } catch (error) {
      console.error(`Error deleting child ${name}:`, error);
      throw new Error(`Failed to delete child: ${name}`);
    }
  }

  /**
   * Gets all children for the parent.
   */
  public static async getAll(): Promise<Child[]> {
    const parent = await ParentRepository.get();
    if (!parent) return [];

    const children: Child[] = [];
    for (const childName of parent.children) {
      const child = await this.get(childName);
      if (child) {
        children.push(child);
      }
    }

    return children;
  }

  /**
   * Adds an account reference to a child.
   */
  public static async addAccount(childName: string, accountName: string): Promise<void> {
    const child = await this.get(childName);
    if (!child) throw new Error('Child not found');

    const normalizedName = normalizeName(accountName);
    
    // Check if account already exists
    if (child.accounts.some(a => normalizeName(a) === normalizedName)) {
      throw new Error('Account already exists for this child');
    }

    child.accounts.push(accountName.toLowerCase());
    await this.save(child);
  }

  /**
   * Removes an account reference from a child.
   */
  public static async removeAccount(childName: string, accountName: string): Promise<void> {
    const child = await this.get(childName);
    if (!child) throw new Error('Child not found');

    const normalizedName = normalizeName(accountName);
    child.accounts = child.accounts.filter(a => normalizeName(a) !== normalizedName);
    
    await this.save(child);
  }

  /**
   * Updates the child's current balance and timestamp.
   */
  public static async updateBalance(childName: string, balance: number, timestamp: number): Promise<void> {
    const child = await this.get(childName);
    if (!child) throw new Error('Child not found');

    child.cb = balance;
    child.cbts = timestamp;
    await this.save(child);
  }
}

// ============================================================================
// Account Repository
// ============================================================================

export class AccountRepository {
  /**
   * Gets an account by child and account name.
   */
  public static async get(childName: string, accountName: string): Promise<Account | null> {
    try {
      const filename = buildAccountFilename(childName, accountName);
      const content = await LocalFileStore.getFile(filename);
      if (!content) return null;

      const account = JSON.parse(content) as Account;
      return account;
    } catch (error) {
      console.error(`Error loading account ${childName}/${accountName}:`, error);
      return null;
    }
  }

  /**
   * Saves an account entity.
   */
  public static async save(childName: string, account: Account): Promise<void> {
    try {
      validateName(account.name, 'Account name');
      
      const filename = buildAccountFilename(childName, account.name);
      const content = JSON.stringify(account, null, 2);
      await LocalFileStore.putFile(filename, content);
    } catch (error) {
      console.error(`Error saving account ${childName}/${account.name}:`, error);
      throw new Error(`Failed to save account: ${account.name}`);
    }
  }

  /**
   * Creates a new account for a child.
   */
  public static async create(childName: string, account: Account): Promise<Account> {
    // Validate name
    validateName(account.name, 'Account name');

    // Check uniqueness within child
    const child = await ChildRepository.get(childName);
    if (child) {
      validateUniqueName(account.name, child.accounts, 'account');
    } else {
      throw new Error('Child not found');
    }

    await this.save(childName, account);
    
    // Add to child
    await ChildRepository.addAccount(childName, account.name);

    return account;
  }

  /**
   * Deletes an account.
   * Removes account reference from child.
   */
  public static async delete(childName: string, accountName: string): Promise<void> {
    try {
      const filename = buildAccountFilename(childName, accountName);
      await LocalFileStore.deleteFile(filename);

      // Remove from child
      await ChildRepository.removeAccount(childName, accountName);
    } catch (error) {
      console.error(`Error deleting account ${childName}/${accountName}:`, error);
      throw new Error(`Failed to delete account: ${accountName}`);
    }
  }

  /**
   * Gets all accounts for a child.
   */
  public static async getAllForChild(childName: string): Promise<Account[]> {
    const child = await ChildRepository.get(childName);
    if (!child) return [];

    const accounts: Account[] = [];
    for (const accountName of child.accounts) {
      const account = await this.get(childName, accountName);
      if (account) {
        accounts.push(account);
      }
    }

    return accounts;
  }

  /**
   * Checks if an account exists.
   */
  public static async exists(childName: string, accountName: string): Promise<boolean> {
    const filename = buildAccountFilename(childName, accountName);
    return await LocalFileStore.fileExists(filename);
  }
}

