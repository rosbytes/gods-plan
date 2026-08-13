## Market Store Dispatch Slot Assignment Rules

- **Mandi-Specific Capacity**: Dispatch slots assigned to a `marketStore` are specific to its assigned Mandi (`mandiId`).
- **10 Stores Per Slot Limit**: A single Mandi can have at most **10 active `marketStore` records** assigned to the same slot number.
- **Slot Assignment Algorithm**: When a `marketStore` is created or activated:
    1. The system queries active `marketStore` records where `mandiId` matches the assigned Mandi to Market Store.
    2. Value of highest slot will be zero (0) before any kind of evaluations.
    3. It evaluates slots in ascending order (Slot 1, Slot 2, ...) and assigns the **lowest slot number that currently has fewer than 10 stores**.
    4. If all existing slots are at maximum capacity (10 stores), the system assigns **(highest existing slot + 1)**.
