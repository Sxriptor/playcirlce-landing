-- Create support_tickets table for contact form submissions
-- Tickets auto-expire after 7 days

-- Drop table if exists
DROP TABLE IF EXISTS support_tickets CASCADE;

-- Create enum for help type
DO $$ BEGIN
    CREATE TYPE support_help_type AS ENUM (
        'partnership',
        'general_inquiry',
        'feedback',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the support_tickets table
CREATE TABLE support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    help_type support_help_type NOT NULL,
    message text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL
);

-- Create index on expires_at for efficient cleanup
CREATE INDEX idx_support_tickets_expires_at ON support_tickets(expires_at);

-- Create index on created_at for sorting
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Create a function to delete expired tickets
CREATE OR REPLACE FUNCTION delete_expired_support_tickets()
RETURNS void AS $$
BEGIN
    DELETE FROM support_tickets
    WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run daily and delete expired tickets
-- This uses pg_cron extension if available, otherwise needs to be set up separately
-- To enable: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('delete-expired-support-tickets', '0 2 * * *', 'SELECT delete_expired_support_tickets()');

-- Alternative: Create a trigger-based approach for automatic deletion
-- This trigger runs on SELECT and deletes expired records (note: this is less efficient for high-traffic tables)
CREATE OR REPLACE FUNCTION cleanup_expired_tickets_on_query()
RETURNS trigger AS $$
BEGIN
    -- Only run cleanup occasionally (1% of the time) to avoid performance impact
    IF random() < 0.01 THEN
        DELETE FROM support_tickets WHERE expires_at < now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger approach is commented out as it can impact performance
-- Uncomment if pg_cron is not available:
-- CREATE TRIGGER trigger_cleanup_expired_tickets
--     BEFORE INSERT ON support_tickets
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION cleanup_expired_tickets_on_query();

-- Enable Row Level Security
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert (for public contact form)
CREATE POLICY "Anyone can submit support tickets"
ON support_tickets FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated admins can view tickets
-- Note: Only users with panel access can view support tickets
CREATE POLICY "Only admins can view support tickets"
ON support_tickets FOR SELECT
TO authenticated
USING (
    -- Only users with panel access can view tickets
    auth.uid() IN (
        SELECT id FROM profiles WHERE is_panel = true
    )
);

-- Only admins can delete tickets
CREATE POLICY "Only admins can delete support tickets"
ON support_tickets FOR DELETE
TO authenticated
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE is_panel = true
    )
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON support_tickets TO anon, authenticated;
GRANT SELECT, DELETE ON support_tickets TO authenticated;

-- Add comment to table
COMMENT ON TABLE support_tickets IS 'Contact form submissions that auto-expire after 7 days';
COMMENT ON COLUMN support_tickets.expires_at IS 'Timestamp when this ticket will be automatically deleted (7 days from creation)';
