# Feature Specification: Kids Savings Account App

**Feature Branch**: `001-app-definition`  
**Created**: 2025-10-05  
**Status**: Draft  
**Input**: User description: "Simulate a bank account for kids using on-device, non-encrypted internal text files (ASCII only). Parent manages children; each child has Savings or Goal accounts. Supports allowance and interest (weekly/bi-weekly/monthly), transfers within a child, device-time-based balance recalculation, integer-dollar math with round-up on every calculation, no negative balances, unique names, single backup copy per file, and import/export/reset settings."

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a parent, I want a personal, on-device "bank" for my children so they can learn saving habits, earn allowance/interest, move money between their accounts, and track progress toward goals.

### Acceptance Scenarios
1. Given no `PARENT.txt` exists, When the app starts, Then show a welcome/tutorial and prompt for the parent's name, And on confirm create `PARENT.txt` and open the Dashboard.
2. Given `PARENT.txt` exists, When the app starts, Then show a greeting with the parent's name and auto-navigate to the Dashboard after a short delay.
3. Given no children exist, When the Dashboard loads, Then show "[Parent Name] Bank" with a fun bank icon and a hint to add a child.
4. Given the parent adds a child, When entering a unique ASCII name and confirming, Then create `<CHILD_NAME>.txt`, add it to `PARENT.txt`, and open the Child's Dashboard.
5. Given a child exists, When the Dashboard loads, Then list children with their total balances excluding Achieved goal accounts.
6. Given a child's dashboard has no accounts, When it loads, Then guide the user to add an account.
7. Given Add Account is used, When entering details (name, type, allowance, interest, and goal details if Goal) and confirming, Then create `<CHILD_NAME>.<ACCOUNT_NAME>.txt`, reference it in the child file, and display it.
8. Given the Account page is opened, When viewing, Then show the name, current balance, a line chart (Savings) or goal progress bar (Goal), and a newest-first ledger table.
9. Given Deposit or Withdraw is submitted, When confirmed, Then append a ledger entry, run Balance Calculation, and update balances and visuals.
10. Given a Goal account reaches/exceeds goal cost, When the user chooses "Achieved it" and confirms, Then the account becomes read-only and is excluded from totals and accruals.
11. Given two accounts under the same child, When the user transfers an amount from one to the other, Then a Withdraw is posted on the from-account and a Deposit on the to-account; if the amount exceeds the from balance, cap to available and inform the user.
12. Given the app starts or a recalculation trigger occurs, When Balance Calculation runs, Then it posts due Allowance/Interest entries for all elapsed periods and updates Current Balances using integer-dollar arithmetic with round-up.
13. Given the device clock is earlier than the last CBTS, When attempting Balance Calculation, Then show a message and skip processing until the clock is back to present.
14. Given Settings, When Export is selected, Then save all data to a single non-encrypted file on the device; When Import is selected, Then warn that all data will be overridden and on confirm replace all files; When Delete Everything is selected and confirmed, Then remove all internal files and reset.
15. Given the user tries to add a duplicate child name or duplicate account name under a child, When attempting to save, Then block and prompt to choose a different name.

### Edge Cases
- Multiple allowance/interest periods elapsed since last run are posted without duplication and in correct counts.
- Monthly/bi-weekly schedule over varying month lengths and DST changes: Monthly accrual anchors to the account's "anchor day" (the local day-of-month of account creation or the last time the schedule was changed) at 00:00 local. If a month lacks that day (e.g., 29–31), run on that month's last day at 00:00 local. Weekly = every 7 local days; bi-weekly = every 14 local days. All calculations use device local time; determine due periods by local calendar dates (not UTC) to avoid DST issues.
- Transfers between same account are disallowed; zero or negative transfer amounts are rejected.
- Withdrawals that would overdraw are capped to available balance with clear messaging; no negative balances ever stored.
- Percentage interest uses end-of-period balance; rounding is always up to next full dollar.
- File missing/corruption or broken references show clear recovery steps (retry, restore from backup, import, or reset).
- Import fully overrides existing data only after explicit confirmation; operation is atomic at file-set level: The app writes the import to a temporary set and validates it. On success, it replaces all current files in one swap: for each file, move current → backup (overwriting the single backup), then move imported → current. If any step fails at any point, restore all affected files from backups and leave the original set intact; no partial imports persist.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: On app start, detect first-time vs existing user by presence of `PARENT.txt` on device storage.
- **FR-002**: For first-time users, show a welcome/tutorial and prompt for parent's name; upon confirmation, create `PARENT.txt` with parent name and empty children list.
- **FR-003**: For returning users, show a greeting with the parent's name, then auto-open the Dashboard after a brief delay.
- **FR-004**: On every app start and after actions that affect balances, run the Balance Calculation process.
- **FR-005**: Dashboard shows "[Parent Name] Bank" with a playful bank icon and lists all children with total balances; when none exist, show guidance to add children.
- **FR-006**: Adding a child creates `<CHILD_NAME>.txt`, initializes child data, and links it in `PARENT.txt`; names must be ASCII-only and unique per parent (case-insensitive compare).
- **FR-007**: Viewing a child from the Dashboard opens the Child's Dashboard.
- **FR-008**: Deleting a child requires confirmation; removes the child entry from `PARENT.txt`, deletes the child's file and all referenced account files, and refreshes the Dashboard.
- **FR-009**: Child's Dashboard shows total balance (sum of non-achieved accounts) and per-account sections: Savings with last-3-months daily line chart; Goal with progress toward goal cost.
- **FR-010**: Creating an account captures: name; type (Savings|Goal); allowance (enabled, amount in dollars, frequency weekly|bi-weekly|monthly); interest (enabled, type Absolute|Percentage, value, frequency); and for Goal: goal name, goal cost.
- **FR-011**: Creating an account initializes `<CHILD_NAME>.<ACCOUNT_NAME>.txt` with header metadata and an empty ledger; adds account reference to the child's file. Account names must be ASCII-only and unique per child (case-insensitive).
- **FR-012**: Deleting an account requires confirmation; deletes the account file, removes its reference in the child file, and runs Balance Calculation.
- **FR-013**: Account page shows name, current balance, a Savings line chart or Goal progress bar, and a newest-first ledger table with date, description, and signed value.
- **FR-014**: Manual Deposit and Withdraw: on confirm, append an entry with timestamp, type, description, and signed value; then run Balance Calculation and refresh the UI.
- **FR-015**: Transfers within a child: user selects from-account, to-account, and amount; system posts a Withdraw on the from-account and a Deposit on the to-account; if amount > from balance, cap to available and inform the user via a non-blocking toast (e.g., "Capped to $X") and proceed; zero/negative transfers are rejected.
- **FR-016**: Goal accounts can be marked Achieved (with confirmation). Achieved accounts become read-only, excluded from child's total, and ignored for future allowance/interest accrual and for manual deposits/withdrawals.
- **FR-017**: Balance Calculation process:
  - Read children from `PARENT.txt`.
  - For each child, parse account entries; skip Goal accounts marked Achieved.
  - Interest: if enabled, determine due deposits since the most recent interest entry by frequency; create all missing entries. For periods where both interest and allowance are due, compute/post interest first using the pre-allowance end-of-period balance; then post allowance. If Interest is Absolute, value equals configured amount; if Percentage, value equals the end-of-period balance multiplied by the percentage, then rounded up to the next whole dollar; do nothing if disabled or if Goal has reached/exceeded goal cost.
  - Allowance: if enabled, determine due deposits since the most recent allowance entry by frequency; create all missing entries (applied after interest when both are due in the same period); do nothing if disabled or if Goal has reached/exceeded goal cost.
  - Recompute current balance using CB and CBTS from the child file by applying ledger entries with timestamp greater than CBTS; update CB and CBTS in the child file.
- **FR-018**: Supported frequencies: weekly, bi-weekly (14 days), monthly. Monthly anchor day rule: Use the account's anchor day (local day-of-month from creation or last schedule change) at 00:00 local; if that day doesn't exist in a month, execute on that month’s last day at 00:00 local. Schedules are based on device local time and local calendar dates.
- **FR-019**: All monetary values operate in integer dollars only; every calculation step rounds up to the next full dollar before persisting or displaying.
- **FR-020**: Negative balances are not permitted. If a withdraw or transfer would overdraw, cap the amount to the available balance and show a non-blocking toast; proceed with the capped amount.
- **FR-021**: Ledger entries include timestamp, type (Deposit|Withdraw), description, and signed value; the file stores entries ordered by timestamp.
- **FR-022**: Use the device's current local time for calculations. If current time is earlier than the last CBTS, show a message and skip Balance Calculation until the clock is back to present.
- **FR-023**: Settings – Export: save all user data to a single non-encrypted file in the device file system. Format: ASCII-only JSON manifest containing all internal files with their paths and contents embedded as strings.
- **FR-024**: Settings – Import: warn that import will override all files; on confirmation, delete existing files and replace them with imported ones. Import accepts the same ASCII-only JSON manifest format.
- **FR-025**: Settings – Delete Everything: on confirmation, remove all internal files and reset the app to first-time state.
- **FR-026**: File storage is local, non-encrypted, ASCII-only content. Maintain exactly one backup copy per internal file to enable restore to a known working state. Backup policy: after a successful write to the current file, atomically overwrite the backup with the previous current version; never update the backup before a successful current write.
- **FR-027**: File naming conventions: `PARENT.txt`, `<CHILD_NAME>.txt`, and `<CHILD_NAME>.<ACCOUNT_NAME>.txt`.
- **FR-028**: UI is clean, friendly, and mobile-first for phones and tablets, with a whimsical bank icon.

### Key Entities *(include if feature involves data)*
- **Parent**: Device owner; attributes: name, list of child references.
- **Child**: Child identity; attributes: name, total balance (computed), list of accounts with current balance (CB) and timestamp (CBTS), references to account files.
- **Account**: Savings or Goal; attributes: name, type, allowance config (enabled, amount, frequency), interest config (enabled, type, value, frequency), goal details (name, cost, achieved flag), ledger reference.
- **Ledger Entry**: Timestamped Deposit or Withdraw; attributes: timestamp, type, description, signed integer-dollar value.
- **Backup File**: One copy per internal file to allow restore.

---

## Clarifications

### Session 2025-10-05

- Q: What format should the single exported file use (ASCII-only), which we’ll also accept on Import? → A: JSON manifest containing all internal files as embedded ASCII strings

- Q: When allowance and interest are both due in the same period for an account, which should be applied first in Balance Calculation? → A: Compute/post interest first based on pre-allowance end-of-period balance, then post allowance

- Q: On monthly schedules, what time of day should accruals occur in local time? → A: 00:00 local (start of day)

- Q: When creating backups (single backup copy per internal file), when should the backup be overwritten? → A: Overwrite backup only after a successful write to the current file

- Q: When a withdrawal/transfer exceeds available balance and we cap to available, how should we message the user? → A: Non-blocking toast and proceed


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



