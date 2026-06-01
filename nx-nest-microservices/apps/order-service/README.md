# Order Service Placeholder

Reserved NX application boundary for order ownership.

Planned responsibilities:

- Order lifecycle and checkout orchestration.
- `order_created` event publishing over NATS.
- Future range-partitioned order tables by `created_at`.
- Dedicated PostgreSQL schema or database when service separation is introduced.
