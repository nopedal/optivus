'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSonner } from '@/hooks/use-sonner';
import { useAuth } from '@/contexts/auth-context';
import { 
  getUserFiles, getUserFolders, uploadFile, starFile, deleteFile, createFolder, FileItem, FolderItem 
} from '@/lib/supabase';
import FileList from '@/components/FileList';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  // State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<{id: string, name: string} | null>(null);
  
  const { toast } = useSonner();
  const { user, signOut } = useAuth();
  
  // Use the authenticated user ID
  const userId = user?.id || '';
  
  // Fetch files and folders on mount or when folder/tab changes
  useEffect(() => {
    // Skip if no user is authenticated
    if (!userId) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Determine which files to load based on the active tab
        let loadedFiles: FileItem[] = [];
        
        switch (activeTab) {
          case 'starred':
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null, true);
            break;
          case 'recent':
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null, false, 'recent');
            break;
          default:
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null);
            break;
        }
        
        // Load folders for current location
        const loadedFolders = await getUserFolders(userId, currentFolder?.id || null);
        
        setFiles(loadedFiles);
        setFolders(loadedFolders);
        
        // Calculate storage used
        const totalStorage = loadedFiles.reduce((total, file) => total + file.size, 0);
        setStorageUsed(totalStorage);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Failed to load data",
          description: "Could not retrieve your files and folders.",
          variant: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [userId, currentFolder, activeTab, toast]);
  
  // Handle file upload
  const handleUploadFiles = async (uploadedFiles: File[]) => {
    try {
      // Upload files to Supabase storage
      const uploadPromises = uploadedFiles.map(file => 
        uploadFile(file, userId, currentFolder?.id || null)
      );
      
      const newFiles = await Promise.all(uploadPromises);
      
      // Update state with new files
      setFiles(prev => [...prev, ...newFiles]);
      
      // Update storage used
      const additionalStorage = newFiles.reduce((total, file) => total + file.size, 0);
      setStorageUsed(prev => prev + additionalStorage);
      
      toast({
        title: "Files uploaded successfully",
        description: `${uploadedFiles.length} file(s) have been uploaded.`,
        variant: "success"
      });
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "error"
      });
    }
  };
  
  // Handle file starring
  const handleStarFile = async (fileId: string, isStarred: boolean) => {
    try {
      await starFile(fileId, !isStarred);
      
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId ? {...file, starred: !isStarred} : file
        )
      );
      
      toast({
        title: isStarred ? "Removed from starred" : "Added to starred",
        description: `File has been ${isStarred ? 'removed from' : 'added to'} starred files.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error starring file:', error);
      toast({
        title: "Operation failed",
        description: "Could not update the file status.",
        variant: "error"
      });
    }
  };
  
  // Handle file deletion
  const handleDeleteFile = async (fileId: string, path: string) => {
    try {
      const fileToDelete = files.find(file => file.id === fileId);
      
      if (fileToDelete) {
        await deleteFile(fileId, path);
        
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setStorageUsed(prev => prev - fileToDelete.size);
        
        toast({
          title: "File deleted",
          description: `${fileToDelete.name} has been deleted.`,
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the file.",
        variant: "error"
      });
    }
  };
  
  // Handle folder creation
  const handleCreateFolder = async () => {
    const folderName = prompt('Enter folder name:');
    
    if (folderName && folderName.trim() !== '') {
      try {
        const newFolder = await createFolder(folderName, userId, currentFolder?.id || null);
        
        setFolders(prev => [...prev, newFolder]);
        
        toast({
          title: "Folder created",
          description: `${folderName} has been created.`,
          variant: "success"
        });
      } catch (error) {
        console.error('Error creating folder:', error);
        toast({
          title: "Failed to create folder",
          description: "Could not create the folder.",
          variant: "error"
        });
      }
    }
  };
  
  // Handle folder navigation
  const handleFolderClick = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      setCurrentFolder({ id: folder.id, name: folder.name });
    }
  };
  
  // Handle navigation back
  const handleNavigateBack = () => {
    setCurrentFolder(null);
  };
  
  // Filter files based on searchQuery
  const filteredFiles = files.filter(file => {
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "error"
      });
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Sidebar 
        storageUsed={storageUsed}
        folders={folders}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFolderClick={handleFolderClick}
        onCreateFolder={handleCreateFolder}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateFolder={handleCreateFolder}
          onUploadFile={() => document.getElementById('file-upload-input')?.click()}
          currentFolder={currentFolder}
          onNavigateBack={handleNavigateBack}
          userName={user?.email || 'User'}
          userAvatar={user?.user_metadata?.avatar_url}
        />
        
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          <FileUpload 
            onUploadFiles={handleUploadFiles}
          />
          
          <FileList 
            files={filteredFiles}
            isLoading={isLoading}
            onStarFile={handleStarFile}
            onDeleteFile={handleDeleteFile}
          />
        </main>
      </div>
    </div>
  );
}