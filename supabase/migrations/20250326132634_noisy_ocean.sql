/*
  # Update profiles table for newsletter and admin approval

  1. Changes
    - Add newsletter_subscribed column
    - Add is_approved column for admin users
    - Add approval_date column

  2. Security
    - Update RLS policies for admin approval
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS newsletter_subscribed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_date timestamptz;

-- Create function to handle admin approval
CREATE OR REPLACE FUNCTION approve_admin()
RETURNS trigger AS $$
BEGIN
  IF NEW.role = 'admin' AND OLD.role != 'admin' THEN
    NEW.is_approved = false;
    NEW.approval_date = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin approval
CREATE TRIGGER check_admin_approval
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION approve_admin();

-- Update RLS policies
CREATE POLICY "Only super admin can approve admins"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin' AND is_approved = true
  ))
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND is_approved = true
    )
  );