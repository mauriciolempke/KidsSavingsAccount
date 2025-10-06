# Kids Savings Account - iOS App

**Status**: Placeholder for future implementation

## Platform
- **Target**: iOS 14+
- **Framework**: React Native with Expo (tentative)
- **Language**: TypeScript

## Features (Planned)
All features from the web app, including:
- Parent and child account management
- Deposit/Withdraw transactions
- Goal tracking with progress visualization
- Allowance and interest accrual
- Transfer between accounts
- Local storage with UTF-8 file persistence
- Import/Export functionality
- Offline-first architecture

## Shared Code
Will leverage `packages/react-core` for:
- Business logic (balance calculation, ledger management)
- Domain models and validation
- Reusable UI components adapted for native

## Platform-Specific Features
- Native iOS navigation patterns
- iOS-specific storage (AsyncStorage or similar)
- Touch-optimized UI
- Native date/time pickers
- iOS share sheet integration for Export/Import

## Dependencies (Planned)
- React Native
- Expo (if applicable)
- react-core package
- Native modules for storage

## Implementation Timeline
🚧 **Deferred** - To be implemented after web app is stable and `react-core` package is extracted.

## Next Steps
1. Complete web app implementation
2. Extract shared logic to `react-core`
3. Set up React Native project structure
4. Adapt UI components for native
5. Implement platform-specific storage layer

