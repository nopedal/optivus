import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

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
  const timestamp = new Date().getTime();
  const path = folderId 
    ? `${userId}/${folderId}/${timestamp}_${file.name}`
    : `${userId}/${timestamp}_${file.name}`;

  const { data, error } = await supabase.storage
    .from('files')
    .upload(path, file);

  if (error) {
    throw error;
  }

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
    throw fileError;
  }

  return fileData[0];
}

export async function getUserFiles(
  userId: string, 
  folderId: string | null = null,
  starredOnly: boolean = false,
  sortBy: 'recent' | 'default' = 'default'
) {
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
    throw error;
  }

  return data.map(file => ({
    ...file,
    modified: new Date(file.modified)
  }));
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
    throw error;
  }

  return data.map(folder => ({
    id: folder.id,
    name: folder.name,
    fileCount: folder.files.count || 0,
    user_id: folder.user_id,
    parent_id: folder.parent_id,
    path: folder.path
  }));
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  return 'other';
}