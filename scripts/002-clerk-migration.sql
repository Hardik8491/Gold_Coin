-- Update users table for Clerk integration
ALTER TABLE users 
  ALTER COLUMN id TYPE VARCHAR(255),
  ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update foreign key references
ALTER TABLE accounts 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE transactions 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE budgets 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE goals 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE bills 
  ALTER COLUMN user_id TYPE VARCHAR(255);

ALTER TABLE gamification 
  ALTER COLUMN user_id TYPE VARCHAR(255);

-- Add Plaid integration fields
ALTER TABLE accounts 
  ADD COLUMN IF NOT EXISTS plaid_access_token TEXT,
  ADD COLUMN IF NOT EXISTS plaid_account_id VARCHAR(255);

-- Create index for Clerk user ID
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
