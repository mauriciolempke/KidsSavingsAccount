/**
 * Validation and Name Normalization Utilities
 * 
 * All names support UTF-8 characters and are compared case-insensitively.
 */

import { CONSTANTS } from './types';

// ============================================================================
// Text Validation
// ============================================================================

/**
 * Validates that a string doesn't contain control characters.
 * Allows all UTF-8 printable characters.
 */
export function validateText(value: string, fieldName: string): void {
  // Only reject control characters (except newline, tab, carriage return which are acceptable in some contexts)
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    // Reject ASCII control characters (0-31) except tab(9), newline(10), carriage return(13)
    // and DEL (127)
    if ((code >= 0 && code < 9) || (code > 13 && code < 32) || code === 127) {
      throw new Error(`${fieldName} contains invalid control characters.`);
    }
  }
}

// ============================================================================
// Name Validation
// ============================================================================

/**
 * Validates a name for length and content.
 * Throws an error if validation fails.
 */
export function validateName(name: string, fieldName: string): void {
  // Check for empty or whitespace-only
  if (!name || name.trim().length === 0) {
    throw new Error(`${fieldName} cannot be empty.`);
  }

  // Check length
  if (name.length < CONSTANTS.MIN_NAME_LENGTH) {
    throw new Error(`${fieldName} must be at least ${CONSTANTS.MIN_NAME_LENGTH} character(s).`);
  }

  if (name.length > CONSTANTS.MAX_NAME_LENGTH) {
    throw new Error(`${fieldName} must be at most ${CONSTANTS.MAX_NAME_LENGTH} characters.`);
  }

  // Validate text (no control characters)
  validateText(name, fieldName);
}

/**
 * Validates a description field.
 */
export function validateDescription(description: string): void {
  if (description.length > CONSTANTS.MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description must be at most ${CONSTANTS.MAX_DESCRIPTION_LENGTH} characters.`);
  }
  validateText(description, 'Description');
}

// ============================================================================
// Name Normalization
// ============================================================================

/**
 * Normalizes a name for comparison (case-insensitive).
 * Returns lowercase version of the name with trimmed whitespace.
 */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Compares two names for equality (case-insensitive).
 */
export function namesEqual(name1: string, name2: string): boolean {
  return normalizeName(name1) === normalizeName(name2);
}

// ============================================================================
// Uniqueness Validation
// ============================================================================

/**
 * Checks if a name is unique in a list (case-insensitive comparison).
 */
export function isNameUnique(name: string, existingNames: string[]): boolean {
  const normalized = normalizeName(name);
  return !existingNames.some(existing => normalizeName(existing) === normalized);
}

/**
 * Validates that a name is unique in a list.
 * Throws an error if the name already exists.
 */
export function validateUniqueName(
  name: string,
  existingNames: string[],
  entityType: string
): void {
  if (!isNameUnique(name, existingNames)) {
    throw new Error(`A ${entityType} with the name "${name}" already exists (names are case-insensitive).`);
  }
}

// ============================================================================
// Amount Validation
// ============================================================================

/**
 * Validates that an amount is a positive integer.
 */
export function validatePositiveAmount(amount: number, fieldName: string): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`${fieldName} must be a whole number (integer).`);
  }

  if (amount <= 0) {
    throw new Error(`${fieldName} must be greater than zero.`);
  }
}

/**
 * Validates that an amount is a non-negative integer.
 */
export function validateNonNegativeAmount(amount: number, fieldName: string): void {
  if (!Number.isInteger(amount)) {
    throw new Error(`${fieldName} must be a whole number (integer).`);
  }

  if (amount < 0) {
    throw new Error(`${fieldName} cannot be negative.`);
  }
}

// ============================================================================
// Interest Validation
// ============================================================================

/**
 * Validates percentage interest value (0-100).
 */
export function validateInterestPercentage(percentage: number): void {
  if (percentage < CONSTANTS.MIN_INTEREST_PERCENTAGE || percentage > CONSTANTS.MAX_INTEREST_PERCENTAGE) {
    throw new Error(`Interest percentage must be between ${CONSTANTS.MIN_INTEREST_PERCENTAGE} and ${CONSTANTS.MAX_INTEREST_PERCENTAGE}.`);
  }
}

