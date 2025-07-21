# Database Migration Instructions

## Problem
The listing creation was failing due to a timezone mismatch between the frontend and backend. The `available_from` and `available_until` columns in the `listings` table were defined as `TIMESTAMP WITHOUT TIME ZONE`, but the frontend was sending timezone-aware datetime values.

## Solution
We've updated the backend code to handle timezone conversion automatically, but to fully fix the issue, the database schema needs to be updated.

## Quick Fix (Already Applied)
The backend now automatically converts timezone-aware datetime values to timezone-naive values before saving to the database. This should resolve the immediate issue.

## Full Migration (Recommended)
To properly fix the database schema, run the following SQL migration in your PostgreSQL database:

### Option 1: Using Render.com Database Console
1. Go to your Render.com dashboard
2. Navigate to your PostgreSQL database
3. Open the "Console" tab
4. Copy and paste the migration SQL from `backend/migration_fix_datetime_columns.sql`
5. Execute the migration

### Option 2: Using psql command line
```bash
# Connect to your production database
psql "postgresql://username:password@hostname:port/database_name"

# Run the migration
\i backend/migration_fix_datetime_columns.sql
```

### Option 3: Using pgAdmin or similar GUI
1. Connect to your production database
2. Open a new query window
3. Copy the contents of `backend/migration_fix_datetime_columns.sql`
4. Execute the query

## Migration SQL
The migration does the following:
1. Creates new columns with `TIMESTAMP WITH TIME ZONE` type
2. Copies existing data, treating it as UTC
3. Drops the old columns
4. Renames the new columns to match the original names

## Verification
After running the migration, you can verify it worked by:
1. Checking the column types: `\d listings` in psql
2. Testing listing creation in the application
3. Confirming no more timezone-related errors in the logs

## Rollback (if needed)
If you need to rollback this migration, you can:
1. Rename columns back
2. Create new columns with the old type
3. Copy data back
4. Drop the timezone-aware columns

**Note:** The backend code is now compatible with both the old and new column types, so the migration can be run at any time without breaking the application. 