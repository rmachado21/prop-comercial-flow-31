
-- Fix the generate_proposal_number function to resolve column ambiguity
CREATE OR REPLACE FUNCTION generate_proposal_number(user_uuid UUID)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;
