-- Create agents table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    agent_secret TEXT NOT NULL,
    client_id TEXT UNIQUE NOT NULL,
    model_name TEXT NOT NULL,
    user_id UUID NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON public.agents(user_id);

-- Create index on agent_id for lookups
CREATE INDEX IF NOT EXISTS agents_agent_id_idx ON public.agents(agent_id);

-- Create index on client_id for OAuth lookups
CREATE INDEX IF NOT EXISTS agents_client_id_idx ON public.agents(client_id);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can insert own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON public.agents;

-- Create policy: Users can only see their own agents
CREATE POLICY "Users can view own agents" ON public.agents
    FOR SELECT
    USING (user_id = auth.uid());

-- Create policy: Users can insert their own agents
CREATE POLICY "Users can insert own agents" ON public.agents
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Create policy: Users can update their own agents
CREATE POLICY "Users can update own agents" ON public.agents
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create policy: Users can delete their own agents
CREATE POLICY "Users can delete own agents" ON public.agents
    FOR DELETE
    USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER agents_updated_at
    BEFORE UPDATE ON public.agents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
