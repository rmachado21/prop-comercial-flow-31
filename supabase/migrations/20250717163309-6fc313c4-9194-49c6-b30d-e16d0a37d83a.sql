-- Corrigir funções do banco para adicionar SECURITY DEFINER SET search_path = ''

-- 1. Corrigir função update_proposal_approval_tokens_updated_at
CREATE OR REPLACE FUNCTION public.update_proposal_approval_tokens_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Corrigir função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- 3. Corrigir função get_current_user_role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$function$;

-- 4. Corrigir função handle_new_user_role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

-- 5. Corrigir função generate_proposal_number
CREATE OR REPLACE FUNCTION public.generate_proposal_number(user_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  current_year TEXT;
  sequence_number INTEGER;
  new_proposal_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next sequence number for this user and year
  -- Using table alias 'p' to avoid ambiguity with the variable name
  SELECT COALESCE(MAX(
    CASE 
      WHEN p.proposal_number ~ ('^PROP-' || current_year || '-[0-9]+$')
      THEN CAST(SPLIT_PART(p.proposal_number, '-', 3) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_number
  FROM public.proposals p
  WHERE p.user_id = user_uuid;
  
  new_proposal_number := 'PROP-' || current_year || '-' || LPAD(sequence_number::TEXT, 4, '0');
  
  RETURN new_proposal_number;
END;
$function$;

-- 6. Corrigir função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, company)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'company', '')
  );
  RETURN new;
END;
$function$;

-- 7. Corrigir função update_proposal_totals
CREATE OR REPLACE FUNCTION public.update_proposal_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Update the proposal totals when items change
  UPDATE public.proposals 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM public.proposal_items 
      WHERE proposal_id = COALESCE(NEW.proposal_id, OLD.proposal_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  -- Recalculate total_amount based on subtotal, discount, and tax
  UPDATE public.proposals 
  SET 
    total_amount = subtotal - COALESCE(discount_amount, 0) + COALESCE(tax_amount, 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.proposal_id, OLD.proposal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;