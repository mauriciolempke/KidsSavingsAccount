# Feature Specification: Kids Savings Account – Main Idea and Core Flows

**Feature Branch**: `004-the-main-idea`  
**Created**: 2025-10-05  
**Status**: Draft  
**Input**: User description: "The main idea of the app is to simulate a bank account for kids. The app will not deal with real money, but the intention of the app is to help parents to teach the kids on how to save money. In this case, the parent will act as the bank, holding the kid's money."

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### Scope Overview
This feature defines the core value proposition and end-to-end user experience for a mobile-friendly app that helps parents teach kids saving habits by simulating bank accounts. Parents act as the "bank" and maintain records of each child's accounts, balances, allowances, and goals. No real money movement occurs.

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a parent, I want to create and manage simulated bank accounts for my children so that I can teach them how to save money, track progress toward goals, and reinforce good financial habits.

### Acceptance Scenarios
1. Onboarding – first-time user
   - Given the app is opened for the first time and no parent profile exists
   - When the user completes a brief welcome/tutorial and provides their name
   - Then a parent profile is created and the user is taken to the dashboard displaying an empty children list with guidance to add a child

2. Onboarding – returning user
   - Given the app finds an existing parent profile on startup
   - When the app shows a welcome screen with the parent's name
   - Then the dashboard opens automatically after a short delay

3. Dashboard – viewing and managing children
   - Given the dashboard loads
   - When the system reads the parent profile and child records
   - Then the dashboard displays each child's name and total balance, or a hint to add children if none exist
   - And adding a child prompts for a child name and opens that child’s dashboard
   - And deleting a child requires confirmation and removes that child and their data from the system

4. Child dashboard – viewing overall status
   - Given a child dashboard is opened
   - When the system aggregates balances across that child's non-achieved accounts
   - Then the page shows the child's name, total balance, and sections for each account with its current balance
   - And savings accounts show a line chart of daily balance for the past 3 months
   - And goal accounts show progress toward the goal cost

5. Create account – savings or goal
   - Given the parent chooses to create an account for a child
   - When they provide account name, type (Savings or Goal), and optional Allowance and Interest settings
   - Then the account is created and appears on the child dashboard
   - And for goal accounts, goal name and goal cost are required and progress is displayed accordingly

6. Account detail – deposits, withdrawals, and history
   - Given the parent opens an account detail page
   - When they view the account
   - Then the title shows the account name and current balance, a chart (line for savings, progress toward cost for goals), and a table of transactions ordered newest to oldest
   - And the parent may make a deposit or withdrawal and see the balance, chart, and history update accordingly

7. Goal achieved – read-only
   - Given a goal account has reached or exceeded its goal cost
   - When the parent marks it as "Achieved it" and confirms
   - Then the account becomes read-only and is excluded from the child's total balance going forward

8. Settings – export, import, reset
   - Given the parent opens Settings
   - When they export, import, or delete everything
   - Then the system completes the requested action with clear confirmation and safeguards

9. Balance calculation on app start
   - Given the app starts
   - When the balance calculation process runs
   - Then current balances and timestamps are updated across all non-achieved accounts, including new allowance and interest entries for any missed periods

### Edge Cases
- Multiple allowance or interest periods elapsed since the last calculation should result in multiple entries being created and the balance updated accordingly.
- Time zone changes or device clock adjustments should not cause duplicate or skipped accruals. Accruals are evaluated on UTC period boundaries anchored to the last accrual timestamp; create one entry per fully elapsed period; prevent duplicates by recording the last processed period; never create entries for future-dated periods.
- Withdrawals that would cause negative balances are prevented; users may withdraw up to the available balance only.
- Rounding and currency display: all monetary values use two decimal places; amounts are computed then rounded half-up to the nearest cent at posting; UI displays values consistently with two decimals.
- Deleting a child or account performs a final balance calculation first, then removes the record and references; no accruals are processed afterward for deleted items and no orphan data remains.
- Import requires a valid, versioned package; validation is all-or-nothing. On success, data is restored (replacing existing data with confirmation). On failure, no changes are applied.

---

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: The system MUST support a first-time user flow that welcomes the user, provides a short tutorial, and collects the parent’s name.
- **FR-002**: On subsequent launches, the system MUST identify an existing parent profile, show a welcome with the parent’s name, and automatically open the dashboard after a brief delay.
- **FR-003**: The dashboard MUST display the parent’s name followed by "Bank" and show a list of children with each child’s total balance, or a hint to add children if none exist.
- **FR-004**: Users MUST be able to add a child by entering a name; upon creation, the child’s dashboard opens.
- **FR-005**: Users MUST be able to view a child’s dashboard showing the child’s name, total balance (sum of non-achieved accounts), and each account’s current balance with appropriate visualization by type.
- **FR-006**: Users MUST be able to delete a child with confirmation; upon confirmation, that child’s data is removed and the dashboard list updates accordingly.
- **FR-007**: Users MUST be able to create an account for a child with fields: account name, type (Savings or Goal), optional Allowance settings (enabled, value, frequency: weekly/bi-weekly/monthly), optional Interest settings (enabled, type: percentage/absolute, value, frequency: weekly/bi-weekly/monthly). For Goal accounts, Goal name and Goal cost are required.
- **FR-008**: Users MUST be able to delete an existing account with confirmation; upon deletion, the account is removed from the child’s dashboard and balances are recalculated.
- **FR-009**: The account detail page MUST show the account name, current balance, appropriate visualization (line chart for Savings; progress toward cost for Goal), and a transaction history table ordered by most recent first.
- **FR-010**: Users MUST be able to perform deposits and withdrawals from the account detail page; the system logs the entry with timestamp, description, and signed amount and updates the balance and charts accordingly.
- **FR-011**: For Goal accounts, the UI MUST provide an "Achieved it" action with confirmation; once achieved, the account becomes read-only and is excluded from the child’s total balance thereafter.
- **FR-012**: The system MUST run a balance calculation process at app startup and after actions that affect balances (e.g., deposit/withdraw, account deletion), updating current balances and timestamps.
- **FR-013**: Balance calculation MUST consider Allowance settings: if enabled, create allowance deposit entries according to frequency for any periods elapsed since the last relevant entry.
- **FR-014**: Balance calculation MUST consider Interest settings: if enabled, create interest deposit entries according to frequency for elapsed periods, using absolute amount or percentage of current balance as configured.
- **FR-015**: For Goal accounts that have reached or exceeded the goal cost, the system MUST NOT add further Allowance or Interest entries and MUST allow marking as achieved.
- **FR-016**: Balance calculation MUST ignore accounts marked as achieved (no accruals, excluded from child total balance).
- **FR-017**: After adding accrual entries, the system MUST recompute current balances by applying entries newer than the stored balance timestamp and update the timestamp.
- **FR-018**: The system MUST provide Settings actions to Export data, Import data, and Delete everything, with clear confirmations and user control over file location/selection.
- **FR-019**: The UI MUST be clean, friendly, and mobile-optimized for phones and tablets.
- **FR-020**: All app data MUST be stored on-device and presented as simulated money only; no real financial transactions occur.

*Resolved policies:*
- Negative balance policy on withdrawals: withdrawals cannot result in negative balances; maximum withdrawal equals current available balance.
- Accrual time basis and duplicate prevention: accruals use UTC period boundaries anchored to the last accrual; one entry per fully elapsed period; never post future periods; duplicates prevented by tracking the last processed period.
- Currency rounding and formatting: values use two decimal places; round half-up to the nearest cent at the time of posting; UI displays two decimals consistently.
- Import validation and versioning: imports must be versioned; validation is transactional (all-or-nothing). On success, replace existing data with user confirmation; on failure, existing data remains unchanged.

### Key Entities (high-level)
- **Parent**: Represents the device owner; has a name and a list of children.
- **Child**: Represents a child; has a name, a total balance (sum of non-achieved accounts), and a list of accounts.
- **Account**: Represents a Savings or Goal account; has a name, type, current balance, last balance timestamp, and configuration for Allowance and Interest. Goal accounts include goal name, goal cost, and achieved status.
- **Ledger Entry**: A dated transaction for an account with timestamp, type (Deposit/Withdraw), description, and signed amount; used to compute balances.
- **Allowance Configuration**: Optional; includes enabled flag, value, and frequency (weekly, bi-weekly, monthly).
- **Interest Configuration**: Optional; includes enabled flag, type (percentage or absolute), value, and frequency (weekly, bi-weekly, monthly).
- **Export/Import Package**: Logical representation of the user’s data for backup/restore.

---

## Review & Acceptance Checklist
### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
