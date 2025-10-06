/**
 * Domain Types and Constants for Kids Savings Account
 * 
 * All amounts are in integer dollars (no cents).
 * All timestamps are epoch milliseconds in local time context.
 * All text fields support UTF-8 encoding.
 */

// ============================================================================
// Core Domain Types
// ============================================================================

export type AccountType = 'Savings' | 'Goal';

export type TransactionType = 'Deposit' | 'Withdraw';

export type Frequency = 'weekly' | 'bi-weekly' | 'monthly';

export type InterestType = 'Absolute' | 'Percentage';

// ============================================================================
// Entity Types
// ============================================================================

export interface LedgerEntry {
  timestamp: number; // epoch ms
  type: TransactionType;
  description: string; // UTF-8 supported
  value: number; // signed integer dollars
}

export interface AllowanceConfig {
  enabled: boolean;
  amount?: number; // integer dollars
  frequency?: Frequency;
}

export interface InterestConfig {
  enabled: boolean;
  type?: InterestType;
  value?: number; // integer dollars or percentage (0-100)
  frequency?: Frequency;
}

export interface GoalConfig {
  name: string; // UTF-8 supported
  cost: number; // integer dollars (target amount)
  achieved: boolean;
}

export interface Account {
  name: string; // UTF-8 supported, unique per child (case-insensitive)
  type: AccountType;
  allowance: AllowanceConfig;
  interest: InterestConfig;
  goal?: GoalConfig; // Only for Goal type accounts
  ledger: LedgerEntry[]; // Ordered by timestamp ascending
  createdAt: number; // epoch ms when account was created
}

export interface Child {
  name: string; // UTF-8 supported, unique per parent (case-insensitive)
  avatar: string; // Avatar emoji/icon
  accounts: string[]; // Array of account name references
  cb: number; // Current Balance (integer dollars) - excludes achieved goals
  cbts: number; // Current Balance Timestamp (epoch ms)
}

export interface Parent {
  name: string; // UTF-8 supported
  children: string[]; // Array of child name references
}

// ============================================================================
// Calculation Types
// ============================================================================

export interface AccrualEntry {
  timestamp: number;
  accountName: string;
  type: 'allowance' | 'interest';
  amount: number; // integer dollars
  description: string;
}

export interface BalanceCalculationResult {
  newBalance: number;
  newTimestamp: number;
  accruals: AccrualEntry[];
  ledgerEntries: LedgerEntry[]; // New entries to append to ledger
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageManifest {
  version: string;
  exportedAt: number; // epoch ms
  files: Record<string, string>; // filename -> ASCII content (JSON stringified)
}

export interface BackupFile {
  filename: string;
  content: string; // UTF-8 supported
}

// ============================================================================
// Constants
// ============================================================================

export const CONSTANTS = {
  // File naming patterns
  PARENT_FILE: 'PARENT.txt',
  CHILD_FILE_PREFIX: 'CHILD-',
  ACCOUNT_FILE_PREFIX: 'ACCOUNT-',
  BACKUP_SUFFIX: '.bak',
  
  // Validation limits
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 100,
  
  // Balance calculation
  MIN_BALANCE: 0, // No negative balances allowed
  ROUNDING_MODE: 'up' as const, // Always round up
  
  // Time constants
  MS_PER_DAY: 24 * 60 * 60 * 1000,
  MS_PER_WEEK: 7 * 24 * 60 * 60 * 1000,
  
  // Interest limits
  MAX_INTEREST_PERCENTAGE: 100,
  MIN_INTEREST_PERCENTAGE: 0,
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export function isAccountType(value: string): value is AccountType {
  return value === 'Savings' || value === 'Goal';
}

export function isTransactionType(value: string): value is TransactionType {
  return value === 'Deposit' || value === 'Withdraw';
}

export function isFrequency(value: string): value is Frequency {
  return value === 'weekly' || value === 'bi-weekly' || value === 'monthly';
}

export function isInterestType(value: string): value is InterestType {
  return value === 'Absolute' || value === 'Percentage';
}

// ============================================================================
// Helper Functions
// ============================================================================

export function buildChildFilename(childName: string): string {
  return `${CONSTANTS.CHILD_FILE_PREFIX}${childName.toLowerCase()}.txt`;
}

export function buildAccountFilename(childName: string, accountName: string): string {
  return `${CONSTANTS.ACCOUNT_FILE_PREFIX}${childName.toLowerCase()}-${accountName.toLowerCase()}.txt`;
}

export function buildBackupFilename(filename: string): string {
  return `${filename}${CONSTANTS.BACKUP_SUFFIX}`;
}

export function parseChildFilename(filename: string): string | null {
  if (!filename.startsWith(CONSTANTS.CHILD_FILE_PREFIX)) return null;
  const match = filename.match(/^CHILD-(.+)\.txt$/);
  return match ? match[1] : null;
}

export function parseAccountFilename(filename: string): { child: string; account: string } | null {
  if (!filename.startsWith(CONSTANTS.ACCOUNT_FILE_PREFIX)) return null;
  const match = filename.match(/^ACCOUNT-(.+)-(.+)\.txt$/);
  return match ? { child: match[1], account: match[2] } : null;
}

