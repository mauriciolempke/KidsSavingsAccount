# Data Model

## Entities

### Parent
- name: string (ASCII)
- children: ChildRef[]

### Child
- name: string (ASCII, unique per parent, case-insensitive)
- accounts: AccountRef[]
- cb: number (integer dollars)
- cbts: number (epoch ms)

### Account
- name: string (ASCII, unique per child, case-insensitive)
- type: 'Savings' | 'Goal'
- allowance: { enabled: boolean; amount?: number; frequency?: 'weekly'|'bi-weekly'|'monthly' }
- interest: { enabled: boolean; type?: 'Absolute'|'Percentage'; value?: number; frequency?: 'weekly'|'bi-weekly'|'monthly' }
- goal?: { name: string; cost: number; achieved: boolean }
- ledger: LedgerEntry[] (ordered by timestamp asc)

### LedgerEntry
- timestamp: number (epoch ms, local time context)
- type: 'Deposit' | 'Withdraw'
- description: string (ASCII)
- value: number (signed integer dollars)

### BackupFile
- filename: string
- content: string (ASCII)

## Relationships
- Parent 1..1 → * Children (by filename refs)
- Child 1..1 → * Accounts (by filename refs)
- Account 1..* → LedgerEntry

## Constraints
- ASCII-only names and file contents.
- No negative balances.
- Achieved Goal accounts are read-only and excluded from totals and accruals.
- Monthly anchor day at 00:00 local; interest before allowance when both due.


