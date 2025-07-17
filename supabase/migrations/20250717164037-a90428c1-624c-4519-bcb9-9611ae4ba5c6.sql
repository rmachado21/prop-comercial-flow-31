-- Enable realtime for proposals table
ALTER TABLE public.proposals REPLICA IDENTITY FULL;

-- Add proposals table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;