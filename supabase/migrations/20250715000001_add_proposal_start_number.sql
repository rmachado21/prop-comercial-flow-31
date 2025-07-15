-- Add proposal_start_number field to companies table
ALTER TABLE public.companies 
ADD COLUMN proposal_start_number INTEGER DEFAULT 1;

-- Update the generate_proposal_number function to use new format and start number
CREATE OR REPLACE FUNCTION generate_proposal_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  sequence_number INTEGER;
  start_number INTEGER;
  new_proposal_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the proposal start number for this user's company
  SELECT COALESCE(c.proposal_start_number, 1)
  INTO start_number
  FROM public.companies c
  WHERE c.user_id = user_uuid;
  
  -- If no company found, use default start number
  IF start_number IS NULL THEN
    start_number := 1;
  END IF;
  
  -- Get the next sequence number for this user and year
  -- Check both old format (PROP-YYYY-NNNN) and new format (YYYY-NNN)
  SELECT GREATEST(
    COALESCE(MAX(
      CASE 
        WHEN p.proposal_number ~ ('^PROP-' || current_year || '-[0-9]+$')
        THEN CAST(SPLIT_PART(p.proposal_number, '-', 3) AS INTEGER)
        ELSE 0
      END
    ), 0),
    COALESCE(MAX(
      CASE 
        WHEN p.proposal_number ~ ('^' || current_year || '-[0-9]+$')
        THEN CAST(SPLIT_PART(p.proposal_number, '-', 2) AS INTEGER)
        ELSE 0
      END
    ), 0),
    start_number - 1
  ) + 1
  INTO sequence_number
  FROM public.proposals p
  WHERE p.user_id = user_uuid;
  
  new_proposal_number := current_year || '-' || sequence_number::TEXT;
  
  RETURN new_proposal_number;
END;
$$ LANGUAGE plpgsql;