-- Add policy for admins to update other profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
