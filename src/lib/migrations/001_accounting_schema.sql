-- ============================================================
-- MIGRATION: 001_accounting_schema.sql
-- DebtTrack → Full Accounting SaaS Upgrade
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- ── 1. ENUMS ───────────────────────────────────────────────

CREATE TYPE account_type AS ENUM (
  'Asset',
  'Liability',
  'Equity',
  'Revenue',
  'Expense'
);

CREATE TYPE payment_method_type AS ENUM (
  'Cash',
  'Bank',
  'Card'
);

CREATE TYPE subscription_status AS ENUM (
  'active',
  'past_due',
  'canceled',
  'unpaid'
);

CREATE TYPE billing_cycle AS ENUM (
  'one_time',
  'monthly',
  'yearly'
);

-- ── 2. CHART OF ACCOUNTS (COA) ─────────────────────────────

CREATE TABLE IF NOT EXISTS accounts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_number  TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  type            account_type NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Default COA seed data
INSERT INTO accounts (account_number, name, type) VALUES
  ('1000', 'Cash',                    'Asset'),
  ('1100', 'Accounts Receivable',     'Asset'),
  ('1200', 'Other Current Assets',    'Asset'),
  ('2000', 'Accounts Payable',        'Liability'),
  ('2100', 'Accrued Liabilities',     'Liability'),
  ('3000', 'Owner Equity',            'Equity'),
  ('3100', 'Retained Earnings',       'Equity'),
  ('4000', 'Service Revenue',         'Revenue'),
  ('4100', 'Subscription Revenue',    'Revenue'),
  ('4200', 'Other Revenue',           'Revenue'),
  ('5000', 'Operating Expenses',      'Expense'),
  ('5100', 'Software & Tools',        'Expense'),
  ('5200', 'Salaries & Wages',        'Expense'),
  ('5300', 'Marketing & Advertising', 'Expense'),
  ('5400', 'Office & Admin',          'Expense')
ON CONFLICT (account_number) DO NOTHING;

-- ── 3. JOURNAL ENTRIES (Double-Entry Ledger) ───────────────

CREATE TABLE IF NOT EXISTS journal_entries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date          TIMESTAMPTZ NOT NULL DEFAULT now(),
  description   TEXT        NOT NULL,
  reference_id  TEXT,                       -- e.g. client_id, subscription_id
  reference_type TEXT,                      -- 'payment' | 'debt' | 'expense' | 'subscription'
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_items (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id  UUID        NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id        UUID        NOT NULL REFERENCES accounts(id),
  debit             NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (debit >= 0),
  credit            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (credit >= 0)
);

CREATE INDEX IF NOT EXISTS idx_journal_items_entry ON journal_items(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_ref ON journal_entries(reference_id);

-- ⚖️  Balance enforcement: SUM(debit) = SUM(credit) per entry
-- Using a DEFERRABLE constraint trigger so all items can be inserted before checking
CREATE OR REPLACE FUNCTION check_journal_balance()
RETURNS trigger AS $$
BEGIN
  -- Only validate when rows exist for this entry
  IF EXISTS (SELECT 1 FROM journal_items WHERE journal_entry_id = NEW.journal_entry_id) THEN
    IF (
      ABS(
        COALESCE((SELECT SUM(debit)  FROM journal_items WHERE journal_entry_id = NEW.journal_entry_id), 0) -
        COALESCE((SELECT SUM(credit) FROM journal_items WHERE journal_entry_id = NEW.journal_entry_id), 0)
      ) > 0.01
    ) THEN
      RAISE EXCEPTION 'Journal entry % is unbalanced: debits must equal credits.', NEW.journal_entry_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if re-running migration
DROP TRIGGER IF EXISTS journal_balance_check ON journal_items;

CREATE CONSTRAINT TRIGGER journal_balance_check
  AFTER INSERT OR UPDATE ON journal_items
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION check_journal_balance();

-- ── 4. PRODUCTS / SERVICE CATALOG ─────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT          NOT NULL,
  description         TEXT,
  default_price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate            NUMERIC(5,2)  NOT NULL DEFAULT 0,  -- 0 = disabled, 15 = 15% VAT
  revenue_account_id  UUID          REFERENCES accounts(id),
  created_at          TIMESTAMPTZ   DEFAULT now()
);

-- ── 5. EXPENSES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id                  UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  category_account_id UUID               NOT NULL REFERENCES accounts(id),
  amount              NUMERIC(12,2)      NOT NULL CHECK (amount > 0),
  payment_method      payment_method_type NOT NULL DEFAULT 'Cash',
  date                TIMESTAMPTZ        NOT NULL DEFAULT now(),
  description         TEXT,
  receipt_url         TEXT,
  journal_entry_id    UUID               REFERENCES journal_entries(id),
  created_at          TIMESTAMPTZ        DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_account_id);

-- ── 6. SUBSCRIPTIONS ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         TEXT                NOT NULL,    -- FK to Client.id (text PK)
  status            subscription_status NOT NULL DEFAULT 'active',
  billing_cycle     billing_cycle       NOT NULL DEFAULT 'one_time',
  price             NUMERIC(12,2)       NOT NULL CHECK (price >= 0),
  product_id        UUID                REFERENCES products(id),
  start_date        TIMESTAMPTZ         NOT NULL DEFAULT now(),
  next_billing_date TIMESTAMPTZ,
  canceled_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ         DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_billing_date ON subscriptions(next_billing_date)
  WHERE status = 'active';

-- ── 7. ENABLE REALTIME ON NEW TABLES ───────────────────────
-- Run in Supabase Dashboard → Database → Replication if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;
-- ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
-- ALTER PUBLICATION supabase_realtime ADD TABLE products;
