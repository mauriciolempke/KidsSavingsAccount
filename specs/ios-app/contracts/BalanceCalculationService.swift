import Foundation

/// Service contract for balance calculations, allowance processing, and interest accrual
protocol BalanceCalculationServiceProtocol {
    /// Calculates balances for all children and their accounts
    /// - Throws: CalculationError if calculation fails
    func calculateAllBalances() async throws
    
    /// Calculates balance for a specific child and their accounts
    /// - Parameter child: The child entity to calculate balances for
    /// - Throws: CalculationError if calculation fails
    func calculateBalance(for child: Child) async throws
    
    /// Calculates balance for a specific account
    /// - Parameter account: The account entity to calculate balance for
    /// - Returns: The calculated balance as NSDecimalNumber
    /// - Throws: CalculationError if calculation fails
    func calculateAccountBalance(_ account: Account) async throws -> NSDecimalNumber
    
    /// Processes allowance for all accounts that are due
    /// - Throws: CalculationError if processing fails
    func processAllowances() async throws
    
    /// Processes interest for all accounts that are due
    /// - Throws: CalculationError if processing fails
    func processInterest() async throws
    
    /// Checks if the device clock is skewed (earlier than last calculation)
    /// - Returns: True if clock is skewed, false otherwise
    func isClockSkewed() async throws -> Bool
    
    /// Gets the last calculation timestamp for a child
    /// - Parameter child: The child entity
    /// - Returns: The last calculation timestamp, or nil if never calculated
    func getLastCalculationTimestamp(for child: Child) -> Date?
}

/// Implementation of BalanceCalculationServiceProtocol
class BalanceCalculationService: BalanceCalculationServiceProtocol {
    private let persistenceService: DataPersistenceServiceProtocol
    private let ledgerService: LedgerServiceProtocol
    private let validationService: ValidationServiceProtocol
    
    init(
        persistenceService: DataPersistenceServiceProtocol,
        ledgerService: LedgerServiceProtocol,
        validationService: ValidationServiceProtocol
    ) {
        self.persistenceService = persistenceService
        self.ledgerService = ledgerService
        self.validationService = validationService
    }
    
    func calculateAllBalances() async throws {
        let parentService = ParentService(
            persistenceService: persistenceService,
            validationService: validationService
        )
        
        guard let parent = try await parentService.getCurrentParent() else {
            throw BalanceCalculationError.noParentFound
        }
        
        let children = try await parentService.getChildren(for: parent)
        
        for child in children {
            try await calculateBalance(for: child)
        }
    }
    
    func calculateBalance(for child: Child) async throws {
        // Check for clock skew
        if try await isClockSkewed() {
            throw BalanceCalculationError.clockSkewDetected
        }
        
        // Process allowances and interest first
        try await processAllowances()
        try await processInterest()
        
        // Calculate current balance from ledger entries
        guard let accounts = child.accounts else { return }
        
        var totalBalance = NSDecimalNumber.zero
        
        for case let account as Account in accounts {
            let accountBalance = try await calculateAccountBalance(account)
            
            // Only include non-achieved goal accounts in total
            if account.type == "Savings" || (account.type == "Goal" && account.goal?.achieved == false) {
                totalBalance = totalBalance.adding(accountBalance)
            }
        }
        
        // Update child's current balance and timestamp
        child.currentBalance = totalBalance
        child.currentBalanceTimestamp = Date()
        
        try await persistenceService.saveContext()
    }
    
    func calculateAccountBalance(_ account: Account) async throws -> NSDecimalNumber {
        guard let ledgerEntries = account.ledgerEntries else {
            return NSDecimalNumber.zero
        }
        
        var balance = NSDecimalNumber.zero
        
        for case let entry as LedgerEntry in ledgerEntries {
            let sortedEntries = (ledgerEntries.allObjects as? [LedgerEntry])?.sorted { $0.timestamp < $1.timestamp } ?? []
            
            for entry in sortedEntries {
                switch entry.type {
                case "deposit", "allowance", "interest", "transfer_in":
                    balance = balance.adding(entry.amount)
                case "withdraw", "transfer_out":
                    balance = balance.subtracting(entry.amount)
                default:
                    break
                }
            }
        }
        
        return balance
    }
    
    func processAllowances() async throws {
        let request = NSFetchRequest<AllowanceConfig>(entityName: "AllowanceConfig")
        request.predicate = NSPredicate(format: "enabled == YES")
        
        let allowanceConfigs = try await persistenceService.fetch(request)
        
        for config in allowanceConfigs {
            try await processAllowanceForConfig(config)
        }
    }
    
    func processInterest() async throws {
        let request = NSFetchRequest<InterestConfig>(entityName: "InterestConfig")
        request.predicate = NSPredicate(format: "enabled == YES")
        
        let interestConfigs = try await persistenceService.fetch(request)
        
        for config in interestConfigs {
            try await processInterestForConfig(config)
        }
    }
    
    func isClockSkewed() async throws -> Bool {
        let request = NSFetchRequest<Child>(entityName: "Child")
        
        let children = try await persistenceService.fetch(request)
        
        for child in children {
            if let lastTimestamp = child.currentBalanceTimestamp {
                if Date() < lastTimestamp {
                    return true
                }
            }
        }
        
        return false
    }
    
    func getLastCalculationTimestamp(for child: Child) -> Date? {
        return child.currentBalanceTimestamp
    }
    
    // MARK: - Private Methods
    
    private func processAllowanceForConfig(_ config: AllowanceConfig) async throws {
        guard let account = config.account else { return }
        
        let dueDates = try calculateDueDates(
            for: config.frequency,
            since: config.lastProcessedDate ?? account.createdAt
        )
        
        for dueDate in dueDates {
            try await createAllowanceEntry(
                for: account,
                amount: config.amount,
                date: dueDate
            )
        }
        
        config.lastProcessedDate = dueDates.last
        try await persistenceService.saveContext()
    }
    
    private func processInterestForConfig(_ config: InterestConfig) async throws {
        guard let account = config.account else { return }
        
        let dueDates = try calculateDueDates(
            for: config.frequency,
            since: config.lastProcessedDate ?? account.createdAt
        )
        
        for dueDate in dueDates {
            let accountBalance = try await calculateAccountBalance(account)
            let interestAmount = try calculateInterestAmount(
                type: config.type,
                value: config.value,
                balance: accountBalance
            )
            
            try await createInterestEntry(
                for: account,
                amount: interestAmount,
                date: dueDate
            )
        }
        
        config.lastProcessedDate = dueDates.last
        try await persistenceService.saveContext()
    }
    
    private func calculateDueDates(for frequency: String, since lastDate: Date) throws -> [Date] {
        let calendar = Calendar.current
        var dueDates: [Date] = []
        var currentDate = lastDate
        
        let now = Date()
        
        while currentDate < now {
            switch frequency {
            case "weekly":
                currentDate = calendar.date(byAdding: .day, value: 7, to: currentDate) ?? currentDate
            case "bi-weekly":
                currentDate = calendar.date(byAdding: .day, value: 14, to: currentDate) ?? currentDate
            case "monthly":
                currentDate = calendar.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
            default:
                throw BalanceCalculationError.invalidFrequency(frequency)
            }
            
            if currentDate <= now {
                dueDates.append(currentDate)
            }
        }
        
        return dueDates
    }
    
    private func calculateInterestAmount(
        type: String,
        value: NSDecimalNumber,
        balance: NSDecimalNumber
    ) throws -> NSDecimalNumber {
        switch type {
        case "absolute":
            return value
        case "percentage":
            let percentage = value.dividing(by: NSDecimalNumber(100))
            let interest = balance.multiplying(by: percentage)
            // Round up to next dollar
            return NSDecimalNumber(value: ceil(interest.doubleValue))
        default:
            throw BalanceCalculationError.invalidInterestType(type)
        }
    }
    
    private func createAllowanceEntry(
        for account: Account,
        amount: NSDecimalNumber,
        date: Date
    ) async throws {
        try await ledgerService.createEntry(
            for: account,
            type: "allowance",
            amount: amount,
            description: "Weekly Allowance",
            timestamp: date
        )
    }
    
    private func createInterestEntry(
        for account: Account,
        amount: NSDecimalNumber,
        date: Date
    ) async throws {
        try await ledgerService.createEntry(
            for: account,
            type: "interest",
            amount: amount,
            description: "Interest Payment",
            timestamp: date
        )
    }
}

/// Errors that can be thrown by BalanceCalculationService
enum BalanceCalculationError: Error, LocalizedError {
    case noParentFound
    case clockSkewDetected
    case invalidFrequency(String)
    case invalidInterestType(String)
    case calculationFailed(Error)
    
    var errorDescription: String? {
        switch self {
        case .noParentFound:
            return "No parent found for balance calculation"
        case .clockSkewDetected:
            return "Device clock is skewed. Please correct the time and try again."
        case .invalidFrequency(let frequency):
            return "Invalid frequency: \(frequency)"
        case .invalidInterestType(let type):
            return "Invalid interest type: \(type)"
        case .calculationFailed(let error):
            return "Balance calculation failed: \(error.localizedDescription)"
        }
    }
}
