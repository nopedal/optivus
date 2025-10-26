# Optivus - File Management System

A modern file management application built with Next.js, Supabase, and TypeScript.

## Features

- 📁 File upload with drag & drop support
- 🗂️ Folder organization
- ⭐ File starring/favoriting
- 🔍 File search and filtering
- 📱 Responsive design
- 🔐 User authentication
- ☁️ Cloud storage with Supabase

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Setup Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

### 3. Setup Supabase Database

Create the following tables in your Supabase database:

```sql
-- Files table
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

-- Folders table
CREATE TABLE folders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  path text,
  created_at timestamp with time zone DEFAULT now()
);
```

### 4. Create Storage Bucket

In your Supabase dashboard:
1. Go to Storage
2. Create a new bucket called `files`
3. Set appropriate permissions

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Troubleshooting

### Issues Fixed:

✅ **Infinite loading files** - Fixed by adding proper error handling and configuration checks
✅ **Cannot upload files** - Fixed by improving upload error handling and Supabase configuration
✅ **Missing environment variables** - Added configuration checker and setup guide

### Common Issues:

- **Configuration Error**: Make sure your `.env.local` file has the correct Supabase credentials
- **Upload fails**: Verify your storage bucket is created and has proper permissions
- **Files not loading**: Check that your database tables exist and RLS policies are configured

See `SETUP_GUIDE.md` for detailed troubleshooting instructions.

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # UI components
│   ├── auth/           # Authentication components
│   └── providers/      # Context providers
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions and Supabase client
└── public/             # Static assets
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Supabase** - Backend as a service
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **React Dropzone** - File upload
- **Lucide React** - Icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
