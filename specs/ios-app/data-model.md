# Data Model: Kids Savings Account iOS App

## Core Data Entities

### Parent Entity
```swift
@objc(Parent)
public class Parent: NSManagedObject {
    @NSManaged public var name: String
    @NSManaged public var createdAt: Date
    @NSManaged public var children: NSSet?
}
```

**Attributes**:
- `name`: String (required, non-optional)
- `createdAt`: Date (required, auto-generated on creation)
- `children`: To-Many relationship to Child entities

**Validation Rules**:
- Name must be non-empty and ASCII-only
- Name length between 1-50 characters
- Unique constraint on name (case-insensitive)

### Child Entity
```swift
@objc(Child)
public class Child: NSManagedObject {
    @NSManaged public var name: String
    @NSManaged public var avatar: String
    @NSManaged public var createdAt: Date
    @NSManaged public var currentBalance: NSDecimalNumber
    @NSManaged public var currentBalanceTimestamp: Date
    @NSManaged public var parent: Parent?
    @NSManaged public var accounts: NSSet?
}
```

**Attributes**:
- `name`: String (required, non-optional)
- `avatar`: String (optional, default emoji)
- `createdAt`: Date (required, auto-generated)
- `currentBalance`: NSDecimalNumber (required, default 0)
- `currentBalanceTimestamp`: Date (required, auto-generated)
- `parent`: To-One relationship to Parent
- `accounts`: To-Many relationship to Account entities

**Validation Rules**:
- Name must be non-empty and ASCII-only
- Name length between 1-50 characters
- Unique constraint on name within parent (case-insensitive)
- Current balance must be non-negative
- Avatar must be valid emoji or empty string

### Account Entity
```swift
@objc(Account)
public class Account: NSManagedObject {
    @NSManaged public var name: String
    @NSManaged public var type: String
    @NSManaged public var createdAt: Date
    @NSManaged public var child: Child?
    @NSManaged public var ledgerEntries: NSSet?
    @NSManaged public var allowance: AllowanceConfig?
    @NSManaged public var interest: InterestConfig?
    @NSManaged public var goal: GoalConfig?
}
```

**Attributes**:
- `name`: String (required, non-optional)
- `type`: String (required, enum: "Savings" | "Goal")
- `createdAt`: Date (required, auto-generated)
- `child`: To-One relationship to Child
- `ledgerEntries`: To-Many relationship to LedgerEntry entities
- `allowance`: To-One relationship to AllowanceConfig
- `interest`: To-One relationship to InterestConfig
- `goal`: To-One relationship to GoalConfig (optional, required for Goal accounts)

**Validation Rules**:
- Name must be non-empty and ASCII-only
- Name length between 1-50 characters
- Unique constraint on name within child (case-insensitive)
- Type must be valid enum value
- Goal accounts must have goal configuration

### AllowanceConfig Entity
```swift
@objc(AllowanceConfig)
public class AllowanceConfig: NSManagedObject {
    @NSManaged public var enabled: Bool
    @NSManaged public var amount: NSDecimalNumber
    @NSManaged public var frequency: String
    @NSManaged public var lastProcessedDate: Date?
    @NSManaged public var account: Account?
}
```

**Attributes**:
- `enabled`: Bool (required, default false)
- `amount`: NSDecimalNumber (required, default 0)
- `frequency`: String (required, enum: "weekly" | "bi-weekly" | "monthly")
- `lastProcessedDate`: Date (optional, tracks last processing)
- `account`: To-One relationship to Account

**Validation Rules**:
- Amount must be positive when enabled
- Frequency must be valid enum value
- Last processed date must not be in future

### InterestConfig Entity
```swift
@objc(InterestConfig)
public class InterestConfig: NSManagedObject {
    @NSManaged public var enabled: Bool
    @NSManaged public var type: String
    @NSManaged public var value: NSDecimalNumber
    @NSManaged public var frequency: String
    @NSManaged public var lastProcessedDate: Date?
    @NSManaged public var account: Account?
}
```

**Attributes**:
- `enabled`: Bool (required, default false)
- `type`: String (required, enum: "absolute" | "percentage")
- `value`: NSDecimalNumber (required, default 0)
- `frequency`: String (required, enum: "weekly" | "bi-weekly" | "monthly")
- `lastProcessedDate`: Date (optional, tracks last processing)
- `account`: To-One relationship to Account

**Validation Rules**:
- Value must be positive when enabled
- Type must be valid enum value
- Frequency must be valid enum value
- Percentage values must be between 0-100

### GoalConfig Entity
```swift
@objc(GoalConfig)
public class GoalConfig: NSManagedObject {
    @NSManaged public var name: String
    @NSManaged public var cost: NSDecimalNumber
    @NSManaged public var achieved: Bool
    @NSManaged public var achievedDate: Date?
    @NSManaged public var account: Account?
}
```

**Attributes**:
- `name`: String (required, non-optional)
- `cost`: NSDecimalNumber (required, positive value)
- `achieved`: Bool (required, default false)
- `achievedDate`: Date (optional, set when achieved)
- `account`: To-One relationship to Account

**Validation Rules**:
- Name must be non-empty and ASCII-only
- Cost must be positive
- Achieved date must not be in future
- Only one goal config per account

### LedgerEntry Entity
```swift
@objc(LedgerEntry)
public class LedgerEntry: NSManagedObject {
    @NSManaged public var timestamp: Date
    @NSManaged public var type: String
    @NSManaged public var description: String
    @NSManaged public var amount: NSDecimalNumber
    @NSManaged public var account: Account?
}
```

**Attributes**:
- `timestamp`: Date (required, auto-generated)
- `type`: String (required, enum: "deposit" | "withdraw" | "allowance" | "interest" | "transfer_in" | "transfer_out")
- `description`: String (required, user-provided or auto-generated)
- `amount`: NSDecimalNumber (required, always positive)
- `account`: To-One relationship to Account

**Validation Rules**:
- Timestamp must not be in future
- Type must be valid enum value
- Description must be non-empty
- Amount must be positive

## Relationships

### Parent ↔ Child
- One-to-Many relationship
- Parent has many children
- Child belongs to one parent
- Cascade delete: Deleting parent deletes all children

### Child ↔ Account
- One-to-Many relationship
- Child has many accounts
- Account belongs to one child
- Cascade delete: Deleting child deletes all accounts

### Account ↔ LedgerEntry
- One-to-Many relationship
- Account has many ledger entries
- LedgerEntry belongs to one account
- Cascade delete: Deleting account deletes all ledger entries

### Account ↔ AllowanceConfig
- One-to-One relationship
- Account has one allowance config
- AllowanceConfig belongs to one account
- Cascade delete: Deleting account deletes allowance config

### Account ↔ InterestConfig
- One-to-One relationship
- Account has one interest config
- InterestConfig belongs to one account
- Cascade delete: Deleting account deletes interest config

### Account ↔ GoalConfig
- One-to-One relationship
- Account has one goal config (optional)
- GoalConfig belongs to one account
- Cascade delete: Deleting account deletes goal config

## Data Validation

### Core Data Validation
- All required attributes have non-optional constraints
- Unique constraints on name fields within their scope
- Range constraints on numeric values
- Enum constraints on string fields with predefined values

### Business Logic Validation
- Account names must be unique within a child
- Child names must be unique within a parent
- Goal accounts must have goal configuration
- Achieved goals cannot be modified
- Negative balances are not allowed
- Transfer amounts must be positive

### Data Integrity
- All relationships have proper inverse relationships
- Cascade delete rules prevent orphaned records
- Timestamp validation prevents future-dated entries
- Balance calculations use NSDecimalNumber for precision

## Migration Strategy

### Version 1.0 (Initial)
- Basic entity structure as defined above
- No migration needed (initial version)

### Future Versions
- Additive changes preferred (new optional attributes)
- Complex changes require migration mappings
- Data validation during migration
- Backup creation before migration

## Performance Considerations

### Indexing
- Index on `Child.name` for fast child lookup
- Index on `Account.name` for fast account lookup
- Index on `LedgerEntry.timestamp` for chronological queries
- Index on `LedgerEntry.type` for transaction type filtering

### Fetch Optimization
- Use NSFetchedResultsController for list displays
- Batch fetching for large ledger entry sets
- Predicate optimization for filtered queries
- Relationship faulting for performance

### Memory Management
- Limit fetched result batch sizes
- Proper relationship faulting
- Cleanup of unused managed objects
- Background context for heavy operations
