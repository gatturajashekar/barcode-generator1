/*
# Add per-item selling price to product_items

## Overview
Each physical clothing piece can have a size-specific selling price (e.g. size M
priced differently from size XL). Previously selling price lived only on the
products table. This adds a nullable selling_price column to product_items so
every barcode label can show the correct price for its size.

Sarees keep a single selling price (copied onto each item for consistency).

## 1. Modified Tables
### `product_items`
- Added `selling_price` (numeric(12,2), nullable) — per-piece selling price.
  Nullable so existing rows (if any) remain valid; new inserts always set it.

## 2. Security
- No policy changes. The existing anon/authenticated INSERT/UPDATE policies on
  product_items cover the new column automatically because the table-level grant
  is not column-restricted.

## 3. Notes
- Does not drop or rename any existing column — no data loss.
- The products.selling_price column stays as the base/category-level price.
  For sarees, product_items.selling_price mirrors it. For clothing, each size
  can carry its own price.
*/

ALTER TABLE product_items
  ADD COLUMN IF NOT EXISTS selling_price numeric(12,2) DEFAULT 0 CHECK (selling_price IS NULL OR selling_price >= 0);
