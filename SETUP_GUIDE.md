# Optivus Setup Guide

## Quick Fix for File Loading and Upload Issues

### Issue: Infinite loading files and cannot upload files

This issue is typically caused by missing or incorrect Supabase configuration. Here's how to fix it:

### 1. Set up Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```bash
# Replace with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

### 2. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy your Project URL and Anon/Public key
5. Paste them into your `.env.local` file

### 3. Set up Database Tables

You need to create these tables in your Supabase database:

#### Files Table
```sql
CREATE TABLE files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  modified timestamp with time zone DEFAULT now(),
  starred boolean DEFAULT false,
  path text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);
```

#### Folders Table
```sql
CREATE TABLE folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  path text,
  created_at timestamp with time zone DEFAULT now()
);
```

### 4. Set up Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Create a new bucket called `files`
3. Set the bucket to public or configure RLS policies as needed

### 5. Configure Row Level Security (Optional but Recommended)

Add RLS policies to secure your data:

```sql
-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Files policies
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- Folders policies
CREATE POLICY "Users can view own folders" ON folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders" ON folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders" ON folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders" ON folders
  FOR DELETE USING (auth.uid() = user_id);
```

### 6. Restart Your Development Server

After setting up the environment variables:

```bash
npm run dev
```

### Troubleshooting

If you're still experiencing issues:

1. **Check the browser console** for error messages
2. **Verify your .env.local file** is in the project root
3. **Make sure your Supabase project is active** and not paused
4. **Check your database tables** exist and have the correct structure
5. **Verify your storage bucket** is created and accessible

### Common Error Messages

- **"Configuration Error"** → Missing environment variables
- **"Upload failed"** → Storage bucket not configured or wrong permissions
- **"Failed to load data"** → Database tables missing or RLS blocking access
- **Infinite loading** → Network issues or missing Supabase configuration

Need help? Check the Supabase documentation or create an issue in the project repository.