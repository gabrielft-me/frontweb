# Google OAuth Setup Guide

## Overview
This application now has Google Authentication integrated with Supabase. Follow these steps to complete the setup.

## Steps to Configure Google OAuth in Supabase

### 1. Access Supabase Dashboard
- Go to: https://fujtsqnsjyqxxinbzsbw.supabase.co
- Navigate to **Authentication** > **Providers**

### 2. Configure Google Provider
1. Find **Google** in the list of providers
2. Toggle it to **Enabled**
3. You'll need to provide:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

### 3. Set Up Google OAuth Credentials

#### Create a Google Cloud Project:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

#### Create OAuth 2.0 Client:
1. Click **Create Credentials** > **OAuth client ID**
2. Select **Web application**
3. Add authorized redirect URIs:
   ```
   https://fujtsqnsjyqxxinbzsbw.supabase.co/auth/v1/callback
   ```
4. For local development, also add:
   ```
   http://localhost:3001/auth/callback
   ```
5. Copy the **Client ID** and **Client Secret**

#### Configure in Supabase:
1. Paste the Client ID and Client Secret in Supabase Dashboard
2. Save the configuration

### 4. Configure Redirect URLs in Supabase
1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - Production: Your production domain
   - Development: `http://localhost:3001`

3. Add redirect URLs (wildcards):
   - `http://localhost:3001/**`
   - Your production URLs

## What's Implemented

### Authentication Flow
- ✅ Google OAuth Sign In
- ✅ Session Management
- ✅ Automatic Redirect to Console after login
- ✅ Protected Routes (Console requires authentication)
- ✅ Sign Out functionality

### Console Features
- ✅ User dashboard showing email
- ✅ Database tables listing
- ✅ Table data viewer
- ✅ Real-time table data display
- ✅ Sign out button

### Files Created
- `src/lib/supabase/client.ts` - Browser Supabase client
- `src/lib/supabase/server.ts` - Server Supabase client
- `src/contexts/auth-context.tsx` - Authentication context provider
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/console/page.tsx` - Database console interface
- `src/middleware.ts` - Route protection middleware
- `.env.local` - Environment variables

### Updated Files
- `src/components/providers.tsx` - Added AuthProvider
- `src/components/sections/hero-section.tsx` - Added Google sign-in button

## Running the Application

```bash
bun dev
```

Visit: http://localhost:3001

## Testing the Flow

1. Click "Sign in with Google" button on the homepage
2. Complete Google OAuth flow
3. You'll be redirected to `/console`
4. The console will display:
   - Your email address
   - Database tables (if any exist)
   - Table data when you click on a table

## Creating Sample Database Tables

To test the console, create tables in Supabase:

1. Go to Supabase Dashboard > **Table Editor**
2. Create a new table (e.g., "users", "products", "posts")
3. Add some columns and rows
4. In the console, you can:
   - Enter the table name manually in the input field
   - Click on common table name suggestions
   - The console will load and display the data

### Manual Table Access

The console now supports **manual table name input**:
- Simply type the table name (e.g., "users", "posts") in the input field
- Press Enter or click "Load"
- The table data will be displayed if the table exists and you have access to it

## Troubleshooting

### "Error loading tables"
- Check that your Supabase project has tables in the public schema
- Verify the API key has correct permissions

### Google OAuth not working
- Verify redirect URLs are correctly configured in both Google Cloud Console and Supabase
- Check that the Client ID and Secret are correct
- Ensure the Google provider is enabled in Supabase

### Not redirecting after login
- Check browser console for errors
- Verify the callback route is working: `/auth/callback`
- Check that middleware is properly configured

## Security Notes

- The `.env.local` file contains your Supabase credentials
- Never commit `.env.local` to version control (it's in .gitignore)
- The anon key is safe to expose in the frontend (it has limited permissions)
- Row Level Security (RLS) should be enabled on your Supabase tables for production

## Next Steps

1. Set up Google OAuth credentials
2. Enable Google provider in Supabase
3. Create database tables for testing
4. Implement Row Level Security policies
5. Add CRUD operations to the console
6. Add data filtering and search
7. Implement pagination for large datasets
