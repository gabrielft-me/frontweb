# Supabase Configuration

## Table of Contents
1. [Database Setup - Agents Table](#database-setup-agents-table)
2. [OAuth Configuration](#oauth-configuration)
3. [Production URL Setup](#production-url-setup)

## Database Setup - Agents Table

Before using the agent creation feature, you need to create the `agents` table in Supabase.

### Steps:

1. **Go to Supabase SQL Editor:**
   - Visit https://app.supabase.com
   - Select your project: `fujtsqnsjyqxxinbzsbw`
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the SQL Migration:**

   **Use CREATE_AGENTS_TABLE_MINIMAL.sql (RECOMMENDED):**

   This is the simplest, most reliable option:

   ```
   1. Open the file: CREATE_AGENTS_TABLE_MINIMAL.sql
   2. Select ALL the text (Ctrl/Cmd + A)
   3. Copy it (Ctrl/Cmd + C)
   4. Go to Supabase SQL Editor
   5. Paste (Ctrl/Cmd + V)
   6. Click the green "Run" button
   7. Wait for success message
   ```

   **What it does:**
   - Drops any existing agents table
   - Creates fresh table with all columns
   - Adds performance indexes
   - Sets proper permissions
   - Verifies columns were created correctly

   **Alternative Options:**
   - `CREATE_AGENTS_TABLE_SIMPLE.sql` - Basic table without RLS
   - `CREATE_AGENTS_TABLE.sql` - Full production setup with Row Level Security

3. **Verify Table Creation:**
   - Go to **Table Editor**
   - You should see the `agents` table with these columns:
     - `id` (UUID, Primary Key)
     - `agent_id` (Text, Unique)
     - `agent_secret` (Text)
     - `client_id` (Text, Unique)
     - `model_name` (Text)
     - `user_id` (UUID, Foreign Key to auth.users)
     - `status` (Text, default: 'active')
     - `created_at` (Timestamp)
     - `updated_at` (Timestamp)

### What the Migration Does:

- ✅ Creates `agents` table with proper schema
- ✅ Adds indexes for faster queries
- ✅ Enables Row Level Security (RLS)
- ✅ Creates policies so users can only access their own agents
- ✅ Sets up automatic `updated_at` timestamp
- ✅ Grants proper permissions

---

# Supabase Configuration for Production

## Critical: Fix OAuth Redirect to Production URL

The OAuth redirect is currently going to `localhost:3000` because Supabase needs to be configured with your production URL.

### Steps to Fix:

## 1. Configure Site URL in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `fujtsqnsjyqxxinbzsbw`
3. Go to **Authentication** > **URL Configuration**
4. Update these settings:

### Site URL
```
https://frontweb-web.vercel.app
```

### Redirect URLs (Add all of these)
```
https://frontweb-web.vercel.app/**
https://frontweb-web.vercel.app/auth/callback
http://localhost:3001/**
http://localhost:3001/auth/callback
```

**Important:** Remove or update any `localhost:3000` entries you see.

## 2. Google OAuth Configuration

In [Google Cloud Console](https://console.cloud.google.com/):

### Authorized JavaScript origins
```
https://frontweb-web.vercel.app
http://localhost:3001
https://fujtsqnsjyqxxinbzsbw.supabase.co
```

### Authorized redirect URIs
```
https://fujtsqnsjyqxxinbzsbw.supabase.co/auth/v1/callback
```

## 3. Vercel Environment Variables

Make sure these are set in your Vercel project:

```
NEXT_PUBLIC_SITE_URL=https://frontweb-web.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://fujtsqnsjyqxxinbzsbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1anRzcW5zanlxeHhpbmJ6c2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjM0MTYsImV4cCI6MjA3Njk5OTQxNn0.v0ITYFPQSCefMgIKlA3KB1ZfGrvOqkckbv8OtloPi2k
```

## 4. Testing

After making these changes:

1. **Redeploy** your Vercel app (changes to environment variables require redeploy)
2. Clear browser cookies/cache
3. Try signing in again
4. You should be redirected to `https://frontweb-web.vercel.app/console`

## Troubleshooting

### Still redirecting to localhost?

1. Check Supabase Dashboard > Authentication > URL Configuration
2. Make sure "Site URL" is set to `https://frontweb-web.vercel.app`
3. Clear all localhost URLs from redirect list
4. Wait a few minutes for changes to propagate
5. Clear browser cookies and try again

### Getting "redirect_uri_mismatch" error?

1. Check Google Cloud Console OAuth settings
2. Make sure `https://fujtsqnsjyqxxinbzsbw.supabase.co/auth/v1/callback` is in Authorized redirect URIs
3. Save changes and wait a few minutes

## Important Notes

- **Site URL** in Supabase controls the default redirect
- **Redirect URLs** in Supabase are the whitelist of allowed URLs
- Changes in Supabase may take a few minutes to propagate
- Always redeploy Vercel after changing environment variables
