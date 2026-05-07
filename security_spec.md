# Security Specification for Civix Manager

## Data Invariants
1.  **Ownership Privacy**: Every document must contain an `ownerId` field matching the `request.auth.uid`. Users can only access data where they are the owner.
2.  **Schema Integrity**: Fields must match expected types (strings, numbers, timestamps) and enums (ProjectStatus, etc.).
3.  **Temporal Integrity**: `createdAt` is immutable; `updatedAt` must be set to `request.time`.
4.  **Input Sanitation**: Document IDs and string fields must have size limits to prevent resource exhaustion attacks.

## The Dirty Dozen Payloads (Target: DENY)

1.  **Identity Spoofing**: Create project with `ownerId: "someone_else"` while authenticated as `user123`.
2.  **Ownership Escalation**: Update an existing project's `ownerId` to yourself.
3.  **Cross-Tenant Leak**: Auth as `user123`, attempt to `get()` a document ID known to belong to `user456`.
4.  **Schema Poisoning**: Update a Material document with `extraField: true`.
5.  **Type Injection**: Set `budget: "100 million"` (string instead of number).
6.  **Resource Exhaustion**: Create a Project with a 1MB string in the `description`.
7.  **ID Poisoning**: Attempt to `create()` a document with ID `../../secrets`.
8.  **Status Violation**: Create a Project with `status: "Waiting for CEO"` (not in enum).
9.  **Timestamp Fake**: Update a document setting `createdAt` to a date in 2010.
10. **Query Scraper**: Attempt to `list` projects without a `where('ownerId', '==', uid)` clause.
11. **Negative Value**: Create a Material with `stockQuantity: -500`.
12. **Unauthenticated Write**: Attempt any write operation without a valid `request.auth` token.

## Test Runner (TDD)
I will implement `firestore.rules.test.ts` to verify these constraints.
