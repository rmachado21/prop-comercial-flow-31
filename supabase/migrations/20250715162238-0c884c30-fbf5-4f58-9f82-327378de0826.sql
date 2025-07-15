-- Insert default user roles for existing users and set super admin
-- 1. Insert 'user' role for all existing users who don't have a role yet
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Insert super_admin role for rmachado21@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('1bf9a2c5-c39e-4eb5-9024-9f5cc1172065', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;