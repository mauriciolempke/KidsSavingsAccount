# Quickstart Guide: Kids Savings Account iOS App

## Overview

This quickstart guide walks through the core user scenarios for the Kids Savings Account iOS app, demonstrating the complete user journey from first launch to managing multiple children's accounts.

## Prerequisites

- iOS 15.0+ device or simulator
- Kids Savings Account app installed
- Basic understanding of iOS navigation patterns

## User Journey 1: First-Time Setup

### Scenario: New parent sets up the app for the first time

**Steps:**
1. **Launch App**: Tap the app icon to launch Kids Savings Account
2. **Welcome Screen**: View the welcome/tutorial screen with iOS-native styling
3. **Enter Parent Name**: 
   - Tap the text field
   - Enter "Alex" using iOS keyboard
   - Tap "Continue" button
4. **Confirmation**: 
   - Review the parent name in the confirmation alert
   - Tap "Confirm" to create the parent profile
5. **Dashboard**: View the main dashboard showing "Alex's Bank" with empty state

**Expected Results:**
- Parent entity created in Core Data
- Welcome screen shows iOS-native animations
- Dashboard displays parent name with SF Symbols bank icon
- Empty state shows guidance to add first child

## User Journey 2: Adding First Child

### Scenario: Parent adds their first child to the system

**Steps:**
1. **Add Child**: 
   - From dashboard, tap "Add Child" button
   - iOS modal presents with form fields
2. **Enter Child Details**:
   - Tap "Name" field and enter "Emma"
   - Tap "Avatar" picker and select 👧 emoji
   - Tap "Save" button
3. **Confirmation**:
   - iOS action sheet confirms child creation
   - Tap "Create Child"
4. **Child Dashboard**: 
   - iOS push navigation to Emma's dashboard
   - View empty state with "Create First Account" button

**Expected Results:**
- Child entity created and linked to parent
- iOS-native navigation with back button
- Child dashboard shows Emma's name and avatar
- Empty state guides to account creation

## User Journey 3: Creating Savings Account

### Scenario: Parent creates a savings account for Emma

**Steps:**
1. **Create Account**:
   - Tap "Create First Account" button
   - iOS modal presents account creation form
2. **Account Details**:
   - Enter "Piggy Bank" as account name
   - Select "Savings" account type
   - Enable allowance: $5.00 weekly
   - Enable interest: 2% monthly
   - Tap "Create Account"
3. **Confirmation**:
   - iOS action sheet confirms account creation
   - Tap "Create Account"
4. **Account View**:
   - View account card showing $0.00 balance
   - See "Piggy Bank" title and savings icon
   - View empty chart area for balance history

**Expected Results:**
- Account entity created with allowance/interest configs
- Account card displays with iOS-native styling
- Balance calculation service initialized
- Chart area ready for transaction history

## User Journey 4: Making First Deposit

### Scenario: Parent makes first deposit to Emma's savings account

**Steps:**
1. **Access Account**:
   - Tap on "Piggy Bank" account card
   - iOS push navigation to account detail view
2. **Make Deposit**:
   - Tap "Deposit" button
   - iOS action sheet presents amount input
   - Enter $25.00 using iOS number pad
   - Add description "Birthday money from Grandma"
   - Tap "Confirm Deposit"
3. **Confirmation**:
   - iOS alert confirms transaction
   - Tap "Deposit" to confirm
4. **Updated View**:
   - Account balance updates to $25.00
   - Ledger shows new deposit entry
   - Chart updates with first data point

**Expected Results:**
- Ledger entry created with proper timestamp
- Balance calculation updates account total
- Chart displays first data point
- iOS animations show balance update

## User Journey 5: Creating Goal Account

### Scenario: Parent creates a goal account for Emma's bike

**Steps:**
1. **Create Goal Account**:
   - Return to Emma's dashboard
   - Tap "Create New Account" button
   - iOS modal presents account form
2. **Goal Details**:
   - Enter "Bike Fund" as account name
   - Select "Goal" account type
   - Enter goal name "New Bike"
   - Enter goal cost $200.00
   - Enable allowance: $10.00 weekly
   - Tap "Create Account"
3. **Confirmation**:
   - iOS action sheet confirms goal creation
   - Tap "Create Account"
4. **Goal View**:
   - View goal account card showing progress
   - See progress bar at 0% (0% complete)
   - View goal details and amount needed

**Expected Results:**
- Goal account created with goal configuration
- Progress bar shows 0% completion
- Goal details display target amount
- Account card uses goal-specific styling

## User Journey 6: Account Transfer

### Scenario: Parent transfers money from savings to goal account

**Steps:**
1. **Initiate Transfer**:
   - From Emma's dashboard, tap "Transfer" button
   - iOS modal presents transfer form
2. **Transfer Details**:
   - Select "From: Piggy Bank"
   - Select "To: Bike Fund"
   - Enter amount $15.00
   - Tap "Transfer Money"
3. **Confirmation**:
   - iOS action sheet confirms transfer
   - Tap "Transfer" to confirm
4. **Updated Balances**:
   - Piggy Bank balance: $10.00
   - Bike Fund balance: $15.00
   - Bike Fund progress: 7.5% complete
   - Both accounts show transfer entries

**Expected Results:**
- Two ledger entries created (withdraw/deposit)
- Balances update correctly
- Progress bar updates to show goal progress
- Transfer entries appear in both account ledgers

## User Journey 7: Allowance Processing

### Scenario: System processes weekly allowance for all accounts

**Steps:**
1. **Background Processing**:
   - App runs background balance calculation
   - System detects allowance is due
2. **Allowance Entries**:
   - Piggy Bank receives $5.00 allowance
   - Bike Fund receives $10.00 allowance
3. **Updated Balances**:
   - Piggy Bank balance: $15.00
   - Bike Fund balance: $25.00
   - Bike Fund progress: 12.5% complete

**Expected Results:**
- Allowance entries created automatically
- Balances update with iOS animations
- Progress indicators reflect new totals
- Background processing completes successfully

## User Journey 8: Goal Achievement

### Scenario: Emma's bike fund reaches the goal amount

**Steps:**
1. **Continue Saving**:
   - Multiple allowance payments over time
   - Bike Fund reaches $200.00
2. **Goal Achievement**:
   - Tap on Bike Fund account
   - View goal achievement notification
   - Tap "Mark as Achieved" button
3. **Confirmation**:
   - iOS alert confirms goal achievement
   - Tap "Achieve Goal" to confirm
4. **Achieved State**:
   - Account becomes read-only
   - Visual indicator shows "Achieved" status
   - Account excluded from total balance calculations

**Expected Results:**
- Goal marked as achieved with timestamp
- Account becomes read-only
- Visual styling indicates achieved state
- Total balance calculations exclude achieved goals

## User Journey 9: Data Export

### Scenario: Parent exports all data for backup

**Steps:**
1. **Access Settings**:
   - Tap settings icon in dashboard
   - iOS modal presents settings options
2. **Export Data**:
   - Tap "Export Data" option
   - iOS share sheet presents
3. **Save Export**:
   - Choose "Save to Files" option
   - Select location and filename
   - Tap "Save"
4. **Confirmation**:
   - iOS alert confirms successful export
   - Tap "OK" to dismiss

**Expected Results:**
- All data exported to single JSON file
- iOS share sheet provides multiple export options
- Export file contains complete data backup
- Confirmation provides user feedback

## User Journey 10: Data Import

### Scenario: Parent imports previously exported data

**Steps:**
1. **Access Settings**:
   - Tap settings icon in dashboard
   - iOS modal presents settings options
2. **Import Data**:
   - Tap "Import Data" option
   - iOS document picker presents
3. **Select File**:
   - Navigate to exported data file
   - Tap to select the file
4. **Confirmation**:
   - iOS alert warns about data replacement
   - Tap "Import" to confirm
5. **Import Complete**:
   - All data replaced with imported data
   - Dashboard refreshes with imported children

**Expected Results:**
- Document picker allows file selection
- Warning alert prevents accidental import
- All data replaced atomically
- UI refreshes to show imported data

## Testing Scenarios

### Accessibility Testing
- VoiceOver navigation through all screens
- Dynamic Type scaling for all text elements
- High contrast mode compatibility
- Switch Control navigation

### Device Testing
- iPhone SE (small screen) layout
- iPhone Pro Max (large screen) layout
- iPad (tablet) adaptive layout
- Device rotation handling

### Performance Testing
- App launch time < 2 seconds
- Balance calculation < 100ms
- Smooth 60fps animations
- Background processing efficiency

## Error Handling

### Common Error Scenarios
- Invalid name input (shows iOS validation alert)
- Insufficient balance for withdrawal (shows iOS warning)
- Clock skew detection (shows iOS alert with guidance)
- Data corruption (shows iOS recovery options)

### Recovery Procedures
- Automatic backup restoration
- Data validation and repair
- User-guided data recovery
- Complete reset option

## Success Criteria

### Functional Success
- All user journeys complete successfully
- Data persists correctly across app sessions
- Balance calculations are accurate
- iOS platform integration works properly

### Performance Success
- App launches quickly on iOS devices
- UI remains responsive during operations
- Background processing completes efficiently
- Memory usage remains within iOS limits

### User Experience Success
- iOS-native feel and interactions
- Accessible to users with disabilities
- Intuitive navigation patterns
- Clear feedback for all actions
