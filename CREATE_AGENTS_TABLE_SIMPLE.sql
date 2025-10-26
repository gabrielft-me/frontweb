-- Simple agents table creation (without RLS for testing)
-- Run this SQL in your Supabase SQL Editor

-- Drop table if it exists (clean slate)
DROP TABLE IF EXISTS public.agents CASCADE;

-- Create agents table
CREATE TABLE public.agents (
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

-- Create indexes for better performance
CREATE INDEX agents_user_id_idx ON public.agents(user_id);
CREATE INDEX agents_agent_id_idx ON public.agents(agent_id);
CREATE INDEX agents_client_id_idx ON public.agents(client_id);

-- Grant permissions (no RLS for now - simpler setup)
GRANT ALL ON public.agents TO authenticated;
GRANT ALL ON public.agents TO anon;
GRANT ALL ON public.agents TO service_role;

-- Success message
SELECT 'Agents table created successfully!' AS message;
