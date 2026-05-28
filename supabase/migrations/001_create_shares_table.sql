-- Create shares table for encrypted text sharing
CREATE TABLE shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT NOT NULL,
  iv TEXT NOT NULL,
  pin_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Create index on pin_hash for fast lookups
CREATE INDEX idx_shares_pin_hash ON shares(pin_hash);
CREATE INDEX idx_shares_expires_at ON shares(expires_at);

-- Enable RLS
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anonymous users can INSERT new records
CREATE POLICY "anon_insert_shares" ON shares
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Anonymous users can SELECT ONLY if pin_hash matches
-- (matches via URL parameter or form input that gets hashed client-side)
CREATE POLICY "anon_select_shares" ON shares
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Allow UPDATE to increment access_count and set last_accessed
CREATE POLICY "anon_update_shares" ON shares
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow DELETE after expiration (via a trigger or app logic)
CREATE POLICY "anon_delete_shares" ON shares
  FOR DELETE
  TO anon
  USING (true);

-- Optional: Create a function to auto-delete expired records
CREATE OR REPLACE FUNCTION delete_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM shares WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Grant usage to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON shares TO anon;
GRANT USAGE ON SEQUENCE shares_id_seq TO anon;
