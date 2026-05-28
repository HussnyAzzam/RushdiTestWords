-- Create shares table for TextShare
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  pin_hash TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  iv TEXT NOT NULL,
  password_hash TEXT,
  accessed BOOLEAN DEFAULT false,
  access_count INT DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE
);

-- Grant permissions to anonymous users
GRANT SELECT, INSERT, DELETE ON public.shares TO anon;

-- Create index on pin_hash for fast lookups
CREATE INDEX IF NOT EXISTS shares_pin_hash_idx ON shares(pin_hash);
CREATE INDEX IF NOT EXISTS shares_expires_at_idx ON shares(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT new shares
CREATE POLICY "Allow anon to insert shares" ON shares
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to SELECT any share
CREATE POLICY "Allow anon to select shares" ON shares
  FOR SELECT
  TO anon
  USING (true);

-- Prevent UPDATE by anonymous users (messages should be immutable)
CREATE POLICY "Prevent anon update shares" ON shares
  FOR UPDATE
  TO anon
  USING (false);

-- Allow DELETE by anonymous users
CREATE POLICY "Allow anon to delete shares" ON shares
  FOR DELETE
  TO anon
  USING (true);

-- Create function to auto-delete expired shares (run via cron)
CREATE OR REPLACE FUNCTION delete_expired_shares()
RETURNS void AS $$
BEGIN
  DELETE FROM shares WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shares_updated_at
BEFORE UPDATE ON shares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
