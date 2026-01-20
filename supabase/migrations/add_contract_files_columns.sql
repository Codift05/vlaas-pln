-- Migration: Add additional columns to contract_files table for Google Drive integration
-- Created: 2025-01-20

-- Add new columns to contract_files table
ALTER TABLE contract_files 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS folder_path TEXT,
ADD COLUMN IF NOT EXISTS file_id TEXT;

-- Add comment to the columns for documentation
COMMENT ON COLUMN contract_files.file_name IS 'Name of the uploaded file on Google Drive';
COMMENT ON COLUMN contract_files.folder_path IS 'Folder path structure on Google Drive (e.g., Berkas Kontrak/AI/Nama Kontrak)';
COMMENT ON COLUMN contract_files.file_id IS 'Google Drive file ID for direct file access';

-- Create index on contract_id for faster queries
CREATE INDEX IF NOT EXISTS idx_contract_files_contract_id ON contract_files(contract_id);

-- Create index on file_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_contract_files_file_id ON contract_files(file_id);
