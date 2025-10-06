# Tasks: Kids Savings Account Web App

**Input**: Design docs at `D:\Code\KidsSavingsAccount\specs\master\`  
**Prerequisites**: plan.md (required), research.md, data-model.md, quickstart.md

## Execution Flow
- Setup → Tests (fail first) → Models → Services → UI → Integration → Polish
- [P] = can run in parallel (different files; no dependency conflicts)

## Phase 3.1: Setup
- [x] T001 Initialize Next.js TypeScript app in `D:\Code\KidsSavingsAccount\apps\web` (no example)
  - Create project scaffolding, `package.json`, `tsconfig.json`, `next.config.js`, `.eslintrc.js`, `.prettierrc`
- [x] T002 Install dependencies in `D:\Code\KidsSavingsAccount\apps\web`: `next react react-dom idb-keyval recharts date-fns zod react-hook-form` and dev: `typescript @types/react @types/node jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest eslint prettier eslint-config-prettier jest-environment-jsdom next/jest`
- [x] T003 [P] Configure TypeScript strict mode and path aliases
  - Edit `D:\Code\KidsSavingsAccount\apps\web\tsconfig.json`
- [x] T004 [P] Configure Jest + RTL with Next.js
  - Add `D:\Code\KidsSavingsAccount\apps\web\jest.config.ts`, `D:\Code\KidsSavingsAccount\apps\web\setupTests.ts`
- [x] T005 [P] Configure ESLint/Prettier
  - Update `D:\Code\KidsSavingsAccount\apps\web\.eslintrc.js`, `D:\Code\KidsSavingsAccount\apps\web\.prettierrc`, add scripts
- [x] T006 [P] Add global styles and theme scaffolding
  - `D:\Code\KidsSavingsAccount\apps\web\src\styles\globals.css`
  - `D:\Code\KidsSavingsAccount\apps\web\src\styles\theme.css`

## Phase 3.2: Tests First (TDD) — Integration/User Flows
Write tests that MUST fail before implementation. One file per scenario.
- [x] T007 [P] Test first-time start creates `PARENT.txt` and opens Dashboard  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\startup_first_time.spec.tsx`
- [x] T008 [P] Test returning user greeting and auto-navigate to Dashboard  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\startup_returning.spec.tsx`
- [x] T009 [P] Test Dashboard empty state and hint to add child  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\dashboard_empty.spec.tsx`
- [x] T010 [P] Test add child (ASCII unique), creates file and opens Child Dashboard  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\add_child.spec.tsx`
- [x] T011 [P] Test Dashboard lists children with totals excluding Achieved goals  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\dashboard_list_children.spec.tsx`
- [x] T012 [P] Test Child Dashboard guides to add account when none  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\child_no_accounts.spec.tsx`
- [x] T013 [P] Test create account with allowance/interest and goal details  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\create_account.spec.tsx`
- [x] T014 [P] Test Account page visuals: name, balance, Savings chart or Goal progress, ledger table  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\account_view.spec.tsx`
- [x] T015 [P] Test Deposit/Withdraw appends ledger, runs Balance Calculation, updates UI  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\deposit_withdraw.spec.tsx`
- [x] T016 [P] Test Goal Achieved sets read-only and excludes from totals/accruals  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\goal_achieved.spec.tsx`
- [x] T017 [P] Test Transfer posts withdraw/deposit, caps amount with toast, rejects zero/negative  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\transfer.spec.tsx`
- [x] T018 [P] Test Balance Calculation posts due allowance/interest; rounding up; interest before allowance  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\balance_calculation.spec.tsx`
- [x] T019 [P] Test device clock earlier than CBTS -> message shown; skip processing  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\clock_skew.spec.tsx`
- [x] T020 [P] Test Export/Import/Delete Everything flows (atomic import, single backup policy)  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\settings_io.spec.tsx`
- [x] T021 [P] Test duplicate child/account names rejected (case-insensitive)  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\uniqueness.spec.tsx`

## Phase 3.3: Core Domain Models (Types + Pure Logic)
- [x] T022 [P] Define domain types and constants  
  `D:\Code\KidsSavingsAccount\apps\web\src\domain\types.ts`
- [x] T023 [P] Implement ASCII validator and name normalization (case-insensitive)  
  `D:\Code\KidsSavingsAccount\apps\web\src\domain\validation.ts`
- [x] T024 [P] Implement rounding helpers (always round up)  
  `D:\Code\KidsSavingsAccount\apps\web\src\domain\calc\round.ts`
- [x] T025 [P] Implement schedule utilities (weekly, bi-weekly, monthly @ 00:00; anchor rules; DST-safe local)  
  `D:\Code\KidsSavingsAccount\apps\web\src\domain\calc\schedule.ts`
- [x] T026 Implement BalanceCalculator (interest→allowance ordering; percentage uses end-of-period balance)  
  `D:\Code\KidsSavingsAccount\apps\web\src\domain\calc\BalanceCalculator.ts`

## Phase 3.4: Persistence Adapters (IndexedDB "virtual files")
- [x] T027 Implement LocalFileStore (UTF-8 support, get/put/list/delete, single backup `<name>.bak`)  
  `D:\Code\KidsSavingsAccount\apps\web\src\persistence\LocalFileStore.ts`
- [x] T028 Implement Import/Export manifest (atomic set swap; validation)  
  `D:\Code\KidsSavingsAccount\apps\web\src\persistence\ManifestIO.ts`
- [x] T029 Implement repositories: ParentRepo, ChildRepo, AccountRepo (file naming, references)  
  `D:\Code\KidsSavingsAccount\apps\web\src\persistence\Repositories.ts`

## Phase 3.5: Domain Services
- [x] T030 [P] ParentService (first-time vs returning; greeting)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\ParentService.ts`
- [x] T031 [P] ChildService (create/delete child; totals excluding Achieved)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\ChildService.ts`
- [x] T032 [P] AccountService (create/delete; goal achieved; read-only rules)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\AccountService.ts`
- [x] T033 [P] LedgerService (append entries; ordering; CB/CBTS recompute)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\LedgerService.ts`
- [x] T034 BalanceCalculationService (iterate all accounts; apply schedules)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\BalanceCalculationService.ts`
- [x] T035 TransferService (cap to available; toast trigger)  
  `D:\Code\KidsSavingsAccount\apps\web\src\services\TransferService.ts`

## Phase 3.6: UI Shell and Navigation (Next.js)
- [x] T036 Create app shell and routes (Dashboard, Child, Account, Settings)  
  `D:\Code\KidsSavingsAccount\apps\web\src\app\layout.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\app\page.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\app\child\[name]\page.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\app\account\[child]\[account]\page.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\app\settings\page.tsx`
- [x] T037 [P] Implement Welcome/Onboarding flow  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\onboarding\Onboarding.tsx`
- [x] T038 [P] Implement Dashboard page and child list with totals  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\dashboard\Dashboard.tsx`
- [x] T039 [P] Implement Child Dashboard (accounts list; guidance when none)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\child\ChildDashboard.tsx`
- [x] T040 [P] Implement Account Page (chart/progress, ledger table)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\account\AccountView.tsx`
- [x] T041 [P] Implement Settings (Export/Import/Delete Everything)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\settings\SettingsView.tsx`
- [x] T042 [P] Implement Toast system (non-blocking notifications)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\ui\Toast.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\state\toastStore.ts`

## Phase 3.7: UI Interactions
- [x] T043 [P] Add Child form (ASCII + uniqueness validation)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\forms\AddChildForm.tsx`
- [x] T044 [P] Add Account form (Savings/Goal + allowance/interest configs)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\forms\AddAccountForm.tsx`
- [x] T045 [P] Deposit/Withdraw form with description and integer dollars  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\forms\TxnForm.tsx`
- [x] T046 [P] Transfer form (from/to; cap; toast)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\forms\TransferForm.tsx`

## Phase 3.8: Charts and Styles
- [x] T047 [P] Savings line chart component (last-3-months daily)  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\charts\SavingsLine.tsx`
- [x] T048 [P] Goal progress bar component  
  `D:\Code\KidsSavingsAccount\apps\web\src\components\charts\GoalProgress.tsx`
- [x] T049 Implement fintech-inspired theme (CSS variables, responsive)  
  `D:\Code\KidsSavingsAccount\apps\web\src\styles\theme.css`

## Phase 3.9: Wire-up & State
- [x] T050 Integrate services with pages/components via React Context/Reducers  
  `D:\Code\KidsSavingsAccount\apps\web\src\state\AppContext.tsx`, `D:\Code\KidsSavingsAccount\apps\web\src\state\reducer.ts`
- [x] T051 Hook BalanceCalculation on app start and after balance-affecting actions  
  `D:\Code\KidsSavingsAccount\apps\web\src\app\providers.tsx`

## Phase 3.10: Make Tests Pass (Implementation)
- [x] T052 Implement behavior to satisfy tests T007–T021 (commit per test)

## Phase 3.11: Polish & Docs
- [x] T053 [P] Unit tests for calc utilities and services  
  `D:\Code\KidsSavingsAccount\apps\web\tests\unit\calc_and_services.spec.ts`
- [x] T054 [P] Performance check: balance calc <50ms per child  
  `D:\Code\KidsSavingsAccount\apps\web\tests\perf\balance_calc.perf.spec.ts`
- [x] T055 [P] Update quickstart and usage docs  
  `D:\Code\KidsSavingsAccount\specs\master\quickstart.md`

## Phase 3.12: Constitution Alignment Additions (Must precede implementation T052)
- [x] T056 Setup platform skeletons per Constitution VI  
  - Create `D:\Code\KidsSavingsAccount\packages\react-core\README.md` (shared core placeholder)
  - Create `D:\Code\KidsSavingsAccount\apps\ios\README.md` (placeholder; implementation deferred)
  - Create `D:\Code\KidsSavingsAccount\apps\android\README.md` (placeholder; implementation deferred)
- [x] T057 [P] Viewport test suite for critical screens (small/large phone, tablet)  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\viewport.spec.tsx`
  - Cover: Dashboard, Child Dashboard, Account, Settings

## Phase 3.13: Coverage Gap Additions (Tests-first; must fail before T052)
- [x] T058 [P] Integration test: Delete Child (confirm + cascading file deletion)  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\delete_child.spec.tsx`
- [x] T059 [P] Integration test: Delete Account (confirm + references updated)  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\delete_account.spec.tsx`
- [x] T060 [P] Integration test: Transfer rejects same-account selection  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\transfer_same_account.spec.tsx`
- [x] T061 [P] Integration test: Withdraw overdraw auto-caps with toast  
  `D:\Code\KidsSavingsAccount\apps\web\tests\integration\withdraw_cap.spec.tsx`
- [x] T062 [P] Unit/integration: Ledger ordering/persistence newest-first  
  `D:\Code\KidsSavingsAccount\apps\web\tests\unit\ledger_ordering.spec.ts`

## Dependencies
- Setup (T001–T006) before tests (T007–T021)
- Constitution setup T056 before implementation and UI work
- Domain models (T022–T026) before services (T030–T035)
- Persistence (T027–T029) before services
- Services before UI (T036–T046)
- UI shell before chart/style integration
- All tests written and failing before T052 implementation
- Additional tests T057–T062 must be written and failing before T052 implementation

## Parallel Execution Examples
```
# Example 1: Run setup configs in parallel
T003, T004, T005, T006 [P]

# Example 2: Write independent integration tests in parallel
T007–T021 [P]

# Example 3: Build domain utilities in parallel
T022–T025 [P]

# Example 4: Build UI components in parallel
T037–T046 [P]
```

## Validation Checklist
- [ ] Every test task precedes related implementation
- [ ] Each entity in data-model has corresponding model/service tasks
- [ ] Import/Export/Backup rules covered by tests and code
- [ ] Rounding rules and ordering (interest before allowance) tested
- [ ] All paths are absolute and unambiguous
