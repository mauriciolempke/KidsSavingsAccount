# Quickstart Guide

## Getting Started

### 1. Launch the Application

```bash
cd D:\Code\KidsSavingsAccount\apps\web
npm install  # If first time
npm run dev
```

Open your browser to **http://localhost:3000**

### 2. First-Time Setup

When you first open the app:
- You'll see a welcome screen
- Enter your name as the parent (ASCII characters only: A-Z, a-z, 0-9, basic punctuation)
- Click **Continue**
- You'll be taken to your Dashboard

### 3. Add Your First Child

From the Dashboard:
1. Click **Add Child**
2. Enter the child's name (e.g., "Emma")
3. Click **Add**
4. The child appears on your Dashboard with a $0 balance

### 4. Create Accounts

Click on a child's name to open their dashboard, then:

#### Create a Savings Account
1. Click **Add Account**
2. Enter account name (e.g., "General Savings")
3. Select **Savings** as account type
4. Optional: Enable **Allowance**
   - Set amount (e.g., $10)
   - Choose frequency (Weekly/Bi-Weekly/Monthly)
5. Optional: Enable **Interest**
   - Select type: Percentage (%) or Fixed Amount ($)
   - Set value (e.g., 5% or $2)
   - Choose frequency
6. Click **Create Account**

#### Create a Goal Account
1. Click **Add Account**
2. Enter account name (e.g., "Bike Fund")
3. Select **Goal** as account type
4. Enter goal name (e.g., "New Bike")
5. Enter target amount (e.g., $200)
6. Optional: Configure allowance/interest same as above
7. Click **Create Account**

### 5. Make Transactions

Click on any account to view details:

#### Deposit Money
1. Click **Deposit**
2. Enter amount (whole dollars, e.g., 25)
3. Enter description (e.g., "Birthday gift")
4. Click **Deposit**
5. The ledger updates immediately

#### Withdraw Money
1. Click **Withdraw**
2. Enter amount (e.g., 10)
3. Enter description (e.g., "Toy purchase")
4. Click **Withdraw**
5. If you try to withdraw more than available, it auto-caps to the balance with a toast notification

#### Transfer Between Accounts
1. Click **Transfer**
2. Select **From Account**
3. Select **To Account** (must be different)
4. Enter amount
5. Click **Transfer**
6. Both accounts update; excess amounts are auto-capped

### 6. Track Progress

- **Savings Accounts**: View a 3-month line chart showing balance history
- **Goal Accounts**: See a visual progress bar showing percentage toward goal
- **Transaction History**: Every account shows a complete ledger with dates, descriptions, and amounts
- **Child Totals**: Dashboard shows total balance per child (excludes achieved goals)

### 7. Automatic Features

The app automatically:
- **Runs balance calculations** on startup and after transactions
- **Applies allowances** based on configured schedules
- **Applies interest** (interest is calculated BEFORE allowance when both are due)
- **Rounds up** all fractional amounts (kids always benefit!)
- **Detects clock skew** and skips calculations if device time is off
- **Marks goals as achieved** when balance reaches target
- **Makes achieved goals read-only** (no more transactions, excluded from totals)

### 8. Data Management

From the Settings page:

#### Export Your Data
1. Click **Export**
2. A JSON file downloads with all your data
3. Save it as a backup

#### Import Data
1. Click **Choose File** under Import
2. Select a previously exported JSON file
3. **Warning**: This replaces ALL current data
4. Existing data is backed up automatically

#### Delete Everything
1. Click **Delete Everything**
2. Confirm the action
3. **Warning**: This is permanent!
4. Useful for starting fresh or testing

### 9. Key Features

- **UTF-8 Support**: All names and descriptions support UTF-8 characters including emojis and international languages
- **Case-Insensitive**: Child names "Emma" and "EMMA" are treated as duplicates
- **No Negative Balances**: Withdrawals are automatically capped to available balance
- **Local Storage**: All data stored in your browser (IndexedDB)
- **Offline Capable**: Works without internet connection
- **Auto-Backup**: Every file change creates a `.bak` backup automatically
- **Mobile Friendly**: Fully responsive design works on phones and tablets

### 10. Example Workflow

**Setting up a weekly allowance with interest:**

1. Add child: "Emma"
2. Create account: "Savings"
   - Enable Allowance: $10, Weekly
   - Enable Interest: 5%, Monthly
3. Make initial deposit: $50, "Starting money"
4. Wait for next week (or adjust your device time for testing)
5. Refresh the app
6. See allowance automatically added to ledger
7. At month-end, see interest calculated on current balance

**Creating a savings goal:**

1. Add child: "Noah"
2. Create account: "Bike Fund" (Goal type)
   - Goal name: "Mountain Bike"
   - Target: $300
3. Make deposits as money is saved
4. Watch progress bar fill up
5. When balance reaches $300, goal automatically marks as achieved
6. Account becomes read-only (mission accomplished!)

### 11. Testing the App

Run integration tests:
```bash
npm test
```

Run performance tests:
```bash
npm test balance_calc.perf
```

### 12. Troubleshooting

**Issue**: App shows "Clock skew detected"
- **Fix**: Check your device time is correct

**Issue**: Account won't accept transactions
- **Check**: Is it a Goal account marked as achieved? (These are read-only)

**Issue**: Balance doesn't match ledger total
- **Check**: Have allowances/interest been applied? Check the ledger for automatic entries

**Issue**: Can't add child named "Emma" but no child with that name exists
- **Check**: Names are case-insensitive. Is there an "EMMA" or "emma" already?

---

## Quick Reference

### Frequencies
- **Weekly**: Every 7 days from last calculation
- **Bi-Weekly**: Every 14 days from last calculation
- **Monthly**: Same day each month (or last day if month shorter)

### Interest Calculation
- **Percentage**: Calculated on current balance (e.g., 5% of $100 = $5)
- **Absolute**: Fixed amount regardless of balance (e.g., $2)
- **Order**: Interest is ALWAYS calculated before allowance

### File Naming
- Parent: `PARENT.txt`
- Child: `CHILD-{childname}.txt` (lowercase)
- Account: `ACCOUNT-{childname}-{accountname}.txt` (lowercase)
- Backup: `{filename}.bak` (one backup per file)

---

**Need help?** Check the specification document at `specs/master/spec.md` for detailed requirements and business rules.
