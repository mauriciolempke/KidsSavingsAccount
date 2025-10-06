/**
 * Parent Service
 * 
 * Handles parent-related operations:
 * - First-time user detection
 * - Parent onboarding
 * - Returning user greeting
 */

import { Parent } from '../domain/types';
import { ParentRepository } from '../persistence/Repositories';
import { validateName } from '../domain/validation';

// ============================================================================
// Parent Service
// ============================================================================

export class ParentService {
  /**
   * Checks if this is a first-time user (no parent exists).
   */
  public static async isFirstTime(): Promise<boolean> {
    return !(await ParentRepository.exists());
  }

  /**
   * Gets the current parent.
   * Returns null if no parent exists.
   */
  public static async getParent(): Promise<Parent | null> {
    return await ParentRepository.get();
  }

  /**
   * Creates a new parent (first-time setup).
   * This should only be called during onboarding.
   */
  public static async createParent(name: string): Promise<Parent> {
    // Validate name
    validateName(name, 'Parent name');

    // Check if parent already exists
    const exists = await ParentRepository.exists();
    if (exists) {
      throw new Error('Parent already exists. Cannot create a new parent.');
    }

    // Create parent
    const parent = await ParentRepository.create(name);
    return parent;
  }

  /**
   * Gets a greeting message for the parent.
   * Returns a personalized greeting based on parent name.
   */
  public static async getGreeting(): Promise<string> {
    const parent = await this.getParent();
    if (!parent) {
      return 'Welcome to Kids Savings Bank!';
    }

    const hour = new Date().getHours();
    let timeOfDay: string;

    if (hour < 12) {
      timeOfDay = 'Good morning';
    } else if (hour < 18) {
      timeOfDay = 'Good afternoon';
    } else {
      timeOfDay = 'Good evening';
    }

    return `${timeOfDay}, ${parent.name}!`;
  }

  /**
   * Gets the parent name.
   * Returns null if no parent exists.
   */
  public static async getParentName(): Promise<string | null> {
    const parent = await this.getParent();
    return parent?.name || null;
  }

  /**
   * Updates the parent name.
   */
  public static async updateParentName(newName: string): Promise<void> {
    validateName(newName, 'Parent name');

    const parent = await this.getParent();
    if (!parent) {
      throw new Error('Parent not found');
    }

    parent.name = newName;
    await ParentRepository.save(parent);
  }

  /**
   * Gets the list of child names.
   */
  public static async getChildNames(): Promise<string[]> {
    const parent = await this.getParent();
    return parent?.children || [];
  }

  /**
   * Gets the number of children.
   */
  public static async getChildCount(): Promise<number> {
    const childNames = await this.getChildNames();
    return childNames.length;
  }
}

