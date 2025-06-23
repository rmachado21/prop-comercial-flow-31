
-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  proposal_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_percentage DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  validity_days INTEGER DEFAULT 30,
  expiry_date DATE,
  notes TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, proposal_number)
);

-- Create proposal items table
CREATE TABLE public.proposal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

-- Create policies for proposals
CREATE POLICY "Users can view their own proposals" 
  ON public.proposals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own proposals" 
  ON public.proposals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals" 
  ON public.proposals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
  ON public.proposals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for proposal items
CREATE POLICY "Users can view items of their own proposals" 
  ON public.proposal_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items for their own proposals" 
  ON public.proposal_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of their own proposals" 
  ON public.proposal_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of their own proposals" 
  ON public.proposal_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_number ON public.proposals(proposal_number);
CREATE INDEX idx_proposal_items_proposal_id ON public.proposal_items(proposal_id);
CREATE INDEX idx_proposal_items_product_id ON public.proposal_items(product_id);

-- Create function to auto-generate proposal numbers
CREATE OR REPLACE FUNCTION generate_proposal_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  sequence_number INTEGER;
  proposal_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get the next sequence number for this user and year
  SELECT COALESCE(MAX(
    CASE 
      WHEN proposal_number ~ ('^PROP-' || current_year || '-[0-9]+$')
      THEN CAST(SPLIT_PART(proposal_number, '-', 3) AS INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO sequence_number
  FROM public.proposals
  WHERE user_id = user_uuid;
  
  proposal_number := 'PROP-' || current_year || '-' || LPAD(sequence_number::TEXT, 4, '0');
  
  RETURN proposal_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update proposal totals
CREATE OR REPLACE FUNCTION update_proposal_totals()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers for automatic total calculation
CREATE TRIGGER trigger_update_proposal_totals_insert
  AFTER INSERT ON public.proposal_items
  FOR EACH ROW EXECUTE FUNCTION update_proposal_totals();

CREATE TRIGGER trigger_update_proposal_totals_update
  AFTER UPDATE ON public.proposal_items
  FOR EACH ROW EXECUTE FUNCTION update_proposal_totals();

CREATE TRIGGER trigger_update_proposal_totals_delete
  AFTER DELETE ON public.proposal_items
  FOR EACH ROW EXECUTE FUNCTION update_proposal_totals();
