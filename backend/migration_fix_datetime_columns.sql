-- Migration to fix datetime columns in listings table
-- This converts TIMESTAMP WITHOUT TIME ZONE to TIMESTAMP WITH TIME ZONE

BEGIN;

-- Add new columns with timezone
ALTER TABLE listings 
ADD COLUMN available_from_new TIMESTAMP WITH TIME ZONE,
ADD COLUMN available_until_new TIMESTAMP WITH TIME ZONE;

-- Copy data from old columns to new columns, treating existing values as UTC
UPDATE listings 
SET available_from_new = available_from AT TIME ZONE 'UTC'
WHERE available_from IS NOT NULL;

UPDATE listings 
SET available_until_new = available_until AT TIME ZONE 'UTC'
WHERE available_until IS NOT NULL;

-- Drop old columns
ALTER TABLE listings DROP COLUMN available_from;
ALTER TABLE listings DROP COLUMN available_until;

-- Rename new columns to original names
ALTER TABLE listings RENAME COLUMN available_from_new TO available_from;
ALTER TABLE listings RENAME COLUMN available_until_new TO available_until;

COMMIT; 