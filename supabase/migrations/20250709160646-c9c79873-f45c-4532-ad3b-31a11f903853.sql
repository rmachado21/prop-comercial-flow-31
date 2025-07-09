-- Create table to track proposal sends
CREATE TABLE public.proposal_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL,
  send_method TEXT NOT NULL CHECK (send_method IN ('email', 'whatsapp')),
  recipient TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proposal_sends ENABLE ROW LEVEL SECURITY;

-- Create policies for proposal_sends
CREATE POLICY "Users can view sends of their own proposals" 
ON public.proposal_sends 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.proposals 
  WHERE proposals.id = proposal_sends.proposal_id 
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can create sends for their own proposals" 
ON public.proposal_sends 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.proposals 
  WHERE proposals.id = proposal_sends.proposal_id 
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can update sends of their own proposals" 
ON public.proposal_sends 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.proposals 
  WHERE proposals.id = proposal_sends.proposal_id 
  AND proposals.user_id = auth.uid()
));

-- Add foreign key constraint
ALTER TABLE public.proposal_sends 
ADD CONSTRAINT proposal_sends_proposal_id_fkey 
FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;