import Foundation

/// Service contract for managing Parent entities and parent-level operations
protocol ParentServiceProtocol {
    /// Creates a new parent with the given name
    /// - Parameter name: The parent's name (must be ASCII-only and unique)
    /// - Returns: The created Parent entity
    /// - Throws: ValidationError if name is invalid, PersistenceError if save fails
    func createParent(name: String) async throws -> Parent
    
    /// Retrieves the current parent entity
    /// - Returns: The current Parent entity, or nil if none exists
    /// - Throws: PersistenceError if data access fails
    func getCurrentParent() async throws -> Parent?
    
    /// Updates the parent's name
    /// - Parameters:
    ///   - parent: The parent entity to update
    ///   - newName: The new name (must be ASCII-only and unique)
    /// - Throws: ValidationError if name is invalid, PersistenceError if save fails
    func updateParent(_ parent: Parent, name: String) async throws
    
    /// Checks if a parent exists in the system
    /// - Returns: True if a parent exists, false otherwise
    /// - Throws: PersistenceError if data access fails
    func parentExists() async throws -> Bool
    
    /// Deletes the parent and all associated data
    /// - Parameter parent: The parent entity to delete
    /// - Throws: PersistenceError if deletion fails
    func deleteParent(_ parent: Parent) async throws
    
    /// Gets all children associated with the parent
    /// - Parameter parent: The parent entity
    /// - Returns: Array of Child entities
    /// - Throws: PersistenceError if data access fails
    func getChildren(for parent: Parent) async throws -> [Child]
}

/// Implementation of ParentServiceProtocol
class ParentService: ParentServiceProtocol {
    private let persistenceService: DataPersistenceServiceProtocol
    private let validationService: ValidationServiceProtocol
    
    init(
        persistenceService: DataPersistenceServiceProtocol,
        validationService: ValidationServiceProtocol
    ) {
        self.persistenceService = persistenceService
        self.validationService = validationService
    }
    
    func createParent(name: String) async throws -> Parent {
        try await validationService.validateParentName(name)
        
        let parent = try await persistenceService.createEntity(Parent.self) { parent in
            parent.name = name
            parent.createdAt = Date()
        }
        
        try await persistenceService.saveContext()
        return parent
    }
    
    func getCurrentParent() async throws -> Parent? {
        let request = NSFetchRequest<Parent>(entityName: "Parent")
        request.fetchLimit = 1
        
        let results = try await persistenceService.fetch(request)
        return results.first
    }
    
    func updateParent(_ parent: Parent, name: String) async throws {
        try await validationService.validateParentName(name)
        
        parent.name = name
        try await persistenceService.saveContext()
    }
    
    func parentExists() async throws -> Bool {
        let parent = try await getCurrentParent()
        return parent != nil
    }
    
    func deleteParent(_ parent: Parent) async throws {
        try await persistenceService.deleteEntity(parent)
        try await persistenceService.saveContext()
    }
    
    func getChildren(for parent: Parent) async throws -> [Child] {
        guard let children = parent.children else { return [] }
        return children.allObjects.compactMap { $0 as? Child }
    }
}

/// Errors that can be thrown by ParentService
enum ParentServiceError: Error, LocalizedError {
    case invalidName(String)
    case parentNotFound
    case persistenceError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidName(let name):
            return "Invalid parent name: \(name)"
        case .parentNotFound:
            return "No parent found in the system"
        case .persistenceError(let error):
            return "Data persistence error: \(error.localizedDescription)"
        }
    }
}
