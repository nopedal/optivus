import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase configuration is missing. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
);

// Storage bucket configuration
export const STORAGE_BUCKET = 'files';

// Check if storage bucket exists (simplified since you created it manually)
export async function initializeStorageBucket() {
  try {
    // Just check if we can access the bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      // Don't fail if we can't list buckets - the bucket might still work
      return true;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (bucketExists) {
      console.log(`Bucket '${STORAGE_BUCKET}' exists and is accessible`);
      return true;
    } else {
      console.warn(`Bucket '${STORAGE_BUCKET}' not found in list, but proceeding anyway`);
      return true; // Proceed anyway since you created it manually
    }
  } catch (error) {
    console.error('Error checking storage bucket:', error);
    return true; // Proceed anyway
  }
}

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date;
  starred: boolean;
  path: string;
  user_id?: string;
  folder_id?: string | null;
};

export type FolderItem = {
  id: string;
  name: string;
  fileCount: number;
  user_id?: string;
  parent_id?: string | null;
  path?: string;
};

export async function uploadFile(file: File, userId: string, folderId: string | null = null) {
  console.log('Upload function called with:', { userId, fileName: file.name, folderId });
  
  if (!userId || !file) {
    throw new Error('User ID and file are required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing');
  }

  // Check current user session
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error:', authError);
    throw new Error(`Authentication error: ${authError.message}`);
  }
  if (!user) {
    throw new Error('No authenticated user found');
  }
  console.log('Authenticated user:', user.id);

  const timestamp = new Date().getTime();
  const path = folderId 
    ? `${userId}/${folderId}/${timestamp}_${file.name}`
    : `${userId}/${timestamp}_${file.name}`;

  try {
    // Skip bucket initialization since you created it manually
    console.log('Uploading to path:', path);

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file);

    if (error) {
      console.error('Storage upload error:', error);
      if (error.message.includes('Bucket not found')) {
        throw new Error(`Storage bucket 'files' not found. Please create it in your Supabase dashboard under Storage > New Bucket > Name: 'files' (private)`);
      }
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from storage upload');
    }

    // Create database record
    const fileRecord = {
      name: file.name,
      type: getFileType(file.type),
      size: file.size,
      modified: new Date(),
      starred: false,
      path: data.path,
      user_id: userId,
      folder_id: folderId
    };

    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert([fileRecord])
      .select();

    if (fileError) {
      console.error('Database insert error:', fileError);
      // Try to clean up uploaded file
      await supabase.storage.from(STORAGE_BUCKET).remove([data.path]);
      throw new Error(`Database error: ${fileError.message}`);
    }

    if (!fileData || fileData.length === 0) {
      console.error('No file data returned from database insert');
      throw new Error('No file data returned from database');
    }

    console.log('File upload successful:', fileData[0]);
    return {
      ...fileData[0],
      modified: new Date(fileData[0].modified) // Ensure date is properly formatted
    };
  } catch (error) {
    console.error('Upload file error:', error);
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

export async function getUserFiles(
  userId: string, 
  folderId: string | null = null,
  starredOnly: boolean = false,
  sortBy: 'recent' | 'default' = 'default'
) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing');
  }

  try {
    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
    
    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }

    if (starredOnly) {
      query = query.eq('starred', true);
    }

    if (sortBy === 'recent') {
      query = query.order('modified', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get user files error:', error);
      throw new Error(`Failed to fetch files: ${error.message}`);
    }

    // Return empty array if no data
    if (!data) {
      return [];
    }

    return data.map(file => ({
      ...file,
      modified: new Date(file.modified),
      // Ensure all required fields are present
      id: file.id,
      name: file.name || 'Unknown file',
      type: file.type || 'document',
      size: file.size || 0,
      starred: file.starred || false,
      path: file.path || '',
    }));
  } catch (error) {
    console.error('Get user files error:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching files');
  }
}

export async function starFile(fileId: string, isStarred: boolean) {
  const { data, error } = await supabase
    .from('files')
    .update({ starred: isStarred })
    .eq('id', fileId)
    .select();

  if (error) {
    throw error;
  }

  return data[0];
}

export async function deleteFile(fileId: string, path: string) {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('files')
    .remove([path]);

  if (storageError) {
    throw storageError;
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId);

  if (dbError) {
    throw dbError;
  }

  return true;
}

export async function createFolder(name: string, userId: string, parentId: string | null = null) {
  const path = parentId 
    ? `${userId}/${parentId}/${name}`
    : `${userId}/${name}`;

  const folder = {
    name,
    user_id: userId,
    parent_id: parentId,
    path
  };

  const { data, error } = await supabase
    .from('folders')
    .insert([folder])
    .select();

  if (error) {
    throw error;
  }

  return {
    ...data[0],
    fileCount: 0
  };
}

export async function getUserFolders(userId: string, parentId: string | null = null) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing');
  }

  try {
    const query = supabase
      .from('folders')
      .select('*, files:files(count)')
      .eq('user_id', userId);
    
    if (parentId) {
      query.eq('parent_id', parentId);
    } else {
      query.is('parent_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get user folders error:', error);
      throw new Error(`Failed to fetch folders: ${error.message}`);
    }

    // Return empty array if no data
    if (!data) {
      return [];
    }

    return data.map(folder => ({
      id: folder.id,
      name: folder.name,
      fileCount: folder.files?.count || 0,
      user_id: folder.user_id,
      parent_id: folder.parent_id,
      path: folder.path
    }));
  } catch (error) {
    console.error('Get user folders error:', error);
    throw error instanceof Error ? error : new Error('Unknown error fetching folders');
  }
}

function getFileType(mimeType: string): string {
  if (!mimeType) return 'document'; // Default for unknown types
  
  const type = mimeType.toLowerCase();
  
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  if (type.includes('zip') || type.includes('compressed') || type.includes('archive')) return 'archive';
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('word') || type.includes('document') || type.includes('text')) return 'document';
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('sheet')) return 'spreadsheet';
  if (type.includes('presentation') || type.includes('powerpoint') || type.includes('slide')) return 'presentation';
  
  // Handle specific MIME types
  if (type === 'application/json' || type === 'text/plain' || type === 'text/html') return 'document';
  if (type === 'application/javascript' || type === 'text/javascript') return 'document';
  
  return 'document'; // Default to document instead of 'other'
}