-- Migration: Add status column to vendor_users table
-- Safe to run multiple times

DO $$ 
BEGIN
    -- Add status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_users' AND column_name = 'status'
    ) THEN
        ALTER TABLE vendor_users ADD COLUMN status VARCHAR(50) DEFAULT 'Aktif';
        RAISE NOTICE 'Column "status" added successfully';
    ELSE
        RAISE NOTICE 'Column "status" already exists';
    END IF;
END $$;

-- Set default status for existing records
UPDATE vendor_users SET status = 'Aktif' WHERE status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_vendor_users_status ON vendor_users(status);

-- Verify
SELECT 'Migration completed' as status;
SELECT id, email, company_name, status FROM vendor_users LIMIT 5;
