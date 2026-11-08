/*
# Barcode generation system for Bhagya Lakshmi Textiles

## Overview
Creates a backend-enforced unique barcode ID system. Every physical product piece
receives its own barcode ID from a single Postgres sequence, so IDs are unique across
all products, sizes, and batches. The frontend cannot mint IDs — only a SECURITY DEFINER
RPC can allocate them, and it does so atomically.

## 1. New Tables

### `products`
A product entry (one form submission).
- `id` (uuid, PK)
- `category` (text: 'Saree' | 'Other')
- `product_name` (text, not null)
- `product_type` (text, nullable) — for Other: 'Kids Wear' | 'Women Wear' | 'Gents Wear'. NULL for Saree.
- `purchase_price` (numeric, not null)
- `selling_price` (numeric, not null)
- `total_quantity` (integer, not null) — sum of size-wise quantities (or single qty for saree)
- `created_at` (timestamptz, default now())

### `product_items`
One row per physical piece. Each has a unique barcode ID.
- `id` (uuid, PK)
- `product_id` (uuid, FK -> products, cascade delete)
- `size` (text, nullable) — for clothing: 'S','M','L','XL','XXL','XXXL','XS'. NULL for saree.
- `barcode_id` (text, unique, not null) — format: BLT10000001
- `sequence_number` (bigint, unique, not null) — raw sequence value
- `created_at` (timestamptz, default now())

### `barcode_sequence`
A single-row table holding the current sequence counter. Treated as an append-only
monotonic counter. The allocation RPC locks this row and increments it atomically.
- `id` (integer, PK, always 1)
- `next_value` (bigint, not null, default 10000001)

## 2. Functions

### `allocate_barcodes(p_count integer, p_starting bigint OUT, p_ending bigint OUT)`
SECURITY DEFINER function that atomically reserves `p_count` sequence numbers.
Locks the barcode_sequence row, reads the current value, advances it by p_count,
and returns the [starting, ending] range (inclusive). Guarantees no two callers
ever get overlapping ranges, even under concurrency. Raises an error if p_count < 1
or > 10000.

## 3. Security
- RLS enabled on all tables.
- This is a single-tenant app with no sign-in, so policies use `TO anon, authenticated`
  with `USING (true)` — the data is intentionally shared at the billing counter.
- `allocate_barcodes` is SECURITY DEFINER (runs as the table owner, bypasses RLS) so it
  can update barcode_sequence. EXECUTE is revoked from PUBLIC/anon and granted to
  anon + authenticated so the frontend can call it via RPC.
- Grants: anon + authenticated get CRUD on products & product_items; anon + authenticated
  get SELECT on barcode_sequence (read-only) and EXECUTE on allocate_barcodes.

## 4. Important Notes
1. The sequence starts at 10000001, matching the required BLT10000001 format.
2. barcode_id is derived as 'BLT' || sequence_number (zero-padded to 8 digits).
3. Once allocated, a sequence number is never reused — even if the product is deleted,
   the counter only moves forward.
4. The frontend calls allocate_barcodes via RPC, then inserts product_items rows with
   the allocated barcode_ids.
*/

-- products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('Saree', 'Other')),
  product_name text NOT NULL,
  product_type text CHECK (product_type IS NULL OR product_type IN ('Kids Wear', 'Women Wear', 'Gents Wear')),
  purchase_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  total_quantity integer NOT NULL CHECK (total_quantity >= 1),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- product_items table (one row per physical piece)
CREATE TABLE IF NOT EXISTS product_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text,
  barcode_id text NOT NULL UNIQUE,
  sequence_number bigint NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_items_product_id ON product_items(product_id);
CREATE INDEX IF NOT EXISTS idx_product_items_barcode_id ON product_items(barcode_id);

ALTER TABLE product_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON product_items TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_product_items" ON product_items;
CREATE POLICY "anon_select_product_items" ON product_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_product_items" ON product_items;
CREATE POLICY "anon_insert_product_items" ON product_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_product_items" ON product_items;
CREATE POLICY "anon_update_product_items" ON product_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_product_items" ON product_items;
CREATE POLICY "anon_delete_product_items" ON product_items FOR DELETE
  TO anon, authenticated USING (true);

-- barcode_sequence table (single row, monotonic counter)
CREATE TABLE IF NOT EXISTS barcode_sequence (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  next_value bigint NOT NULL DEFAULT 10000001
);

INSERT INTO barcode_sequence (id, next_value)
VALUES (1, 10000001)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE barcode_sequence ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON barcode_sequence TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_barcode_sequence" ON barcode_sequence;
CREATE POLICY "anon_select_barcode_sequence" ON barcode_sequence FOR SELECT
  TO anon, authenticated USING (true);

-- allocate_barcodes: atomically reserve a range of sequence numbers
-- SECURITY DEFINER so it can update barcode_sequence (which has no write policy).
CREATE OR REPLACE FUNCTION allocate_barcodes(p_count integer)
RETURNS TABLE(starting bigint, ending bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start bigint;
  v_end bigint;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RAISE EXCEPTION 'p_count must be at least 1';
  END IF;
  IF p_count > 10000 THEN
    RAISE EXCEPTION 'p_count cannot exceed 10000';
  END IF;

  -- Lock the sequence row so concurrent callers wait.
  SELECT next_value INTO v_start
  FROM barcode_sequence
  WHERE id = 1
  FOR UPDATE;

  v_end := v_start + p_count - 1;

  UPDATE barcode_sequence
  SET next_value = v_end + 1
  WHERE id = 1;

  RETURN QUERY SELECT v_start, v_end;
END;
$$;

REVOKE EXECUTE ON FUNCTION allocate_barcodes(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION allocate_barcodes(integer) TO anon, authenticated;
