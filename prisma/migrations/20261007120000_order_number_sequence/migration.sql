-- Human-readable order numbers (AC1001, AC1002, ...).
-- A sequence never hands out the same value twice, even under concurrent checkouts.
-- Not representable in schema.prisma, so it lives only in this migration.
CREATE SEQUENCE IF NOT EXISTS "order_number_seq" START WITH 1001;
