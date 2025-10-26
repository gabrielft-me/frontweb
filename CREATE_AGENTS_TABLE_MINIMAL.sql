-- Minimal agents table - guaranteed to work
-- Step 1: Drop existing table if any
DROP TABLE IF EXISTS public.agents;

-- Step 2: Create the table
CREATE TABLE public.agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    agent_id text NOT NULL UNIQUE,
    agent_secret text NOT NULL,
    client_id text NOT NULL UNIQUE,
    model_name text NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Step 3: Create indexes
CREATE INDEX idx_agents_user_id ON public.agents USING btree (user_id);
CREATE INDEX idx_agents_agent_id ON public.agents USING btree (agent_id);
CREATE INDEX idx_agents_client_id ON public.agents USING btree (client_id);

-- Step 4: Set permissions
ALTER TABLE public.agents OWNER TO postgres;
GRANT ALL ON TABLE public.agents TO postgres;
GRANT ALL ON TABLE public.agents TO authenticated;
GRANT ALL ON TABLE public.agents TO anon;
GRANT ALL ON TABLE public.agents TO service_role;

-- Verify
SELECT 'Table created! Columns:' as status;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'agents'
AND table_schema = 'public'
ORDER BY ordinal_position;
