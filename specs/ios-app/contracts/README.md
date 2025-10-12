# Service Contracts: Kids Savings Account iOS App

This directory contains the service layer contracts that define the interfaces for business logic operations in the iOS app.

## Service Architecture

The app follows a service-oriented architecture with the following service layers:

### Core Services
- **ParentService**: Manages parent entity operations
- **ChildService**: Manages child entity operations  
- **AccountService**: Manages account entity operations
- **LedgerService**: Manages transaction operations
- **BalanceCalculationService**: Handles allowance/interest calculations
- **TransferService**: Manages account-to-account transfers

### Platform Services
- **DataPersistenceService**: Core Data operations and data management
- **ExportImportService**: Data export/import functionality
- **NotificationService**: iOS notifications and alerts
- **BackgroundTaskService**: Background processing and app lifecycle

## Contract Format

Each service contract defines:
- Service interface with method signatures
- Input/output parameter types
- Error handling specifications
- Async/await patterns for iOS
- Documentation and usage examples

## Testing

Each service contract includes:
- Unit test specifications
- Mock implementations for testing
- Integration test scenarios
- Performance benchmarks

## Implementation Notes

- All services use Swift async/await for modern concurrency
- Services are protocol-based for testability
- Error handling follows iOS error handling patterns
- Services integrate with Core Data for persistence
