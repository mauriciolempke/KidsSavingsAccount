# React Core Package

**Status**: Placeholder for future implementation

## Purpose
Shared React components, hooks, and business logic that will be reused across:
- Web app (Next.js)
- iOS app (React Native)
- Android app (React Native)

## Architecture
This package will contain:
- Reusable UI components (buttons, forms, cards)
- Business logic hooks (useBalanceCalculation, useLedger, etc.)
- Shared domain logic (validation, calculation utilities)
- Type definitions
- Styling primitives

## Dependencies
To be determined during refactoring phase. Likely candidates:
- React
- Type definitions
- Utility libraries (date-fns, zod)

## Implementation Status
🚧 **Not yet implemented** - Currently, all logic resides in `apps/web`.
This package will be populated during the multi-platform expansion phase per Constitution VI.

## Next Steps
1. Extract shared domain logic from `apps/web`
2. Create platform-agnostic components
3. Set up build tooling (tsup or similar)
4. Configure exports for tree-shaking

