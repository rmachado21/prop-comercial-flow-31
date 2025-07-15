-- Remove duplicate user role entries, keeping only the highest privilege role for each user
-- This will clean up the case where users have both 'user' and 'super_admin' roles

DELETE FROM public.user_roles 
WHERE id IN (
  SELECT ur1.id 
  FROM public.user_roles ur1
  WHERE ur1.role = 'user'
  AND EXISTS (
    SELECT 1 
    FROM public.user_roles ur2 
    WHERE ur2.user_id = ur1.user_id 
    AND ur2.role = 'super_admin'
  )
);

-- Add a unique constraint to prevent multiple roles per user in the future
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_role UNIQUE (user_id);