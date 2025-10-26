'use client';

import { useState, useEffect } from 'react';
import { useSonner } from '@/hooks/use-sonner';
import { useAuth } from '@/contexts/auth-context';
import { 
  getUserFiles, getUserFolders, uploadFile, starFile, deleteFile, createFolder, FileItem, FolderItem 
} from '@/lib/supabase';
import FileList from '@/components/FileList';
import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ConfigChecker from '@/components/ConfigChecker';
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  // State
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storageUsed, setStorageUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<{id: string, name: string} | null>(null);
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { toast } = useSonner();
  const { user, signOut, isLoading: authLoading } = useAuth();
  
  // Use the authenticated user ID
  const userId = user?.id || '';
  const userName = user?.email?.split('@')[0] || 'User';
  const userAvatar = user?.user_metadata?.avatar_url || '';
  
  // Debug authentication state
  useEffect(() => {
    console.log('Auth state changed:', { 
      user: user?.id, 
      isLoading: authLoading,
      email: user?.email 
    });
  }, [user, authLoading]);
  
  // Fetch files and folders on mount or when folder/tab changes
  useEffect(() => {
    // Don't start loading if auth is still loading
    if (authLoading) {
      return;
    }
    
    let isSubscribed = true; // Track if component is mounted
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 seconds
    
    const loadData = async () => {
      try {
        if (!isSubscribed) return;
        setIsLoading(true);
        
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          if (!isSubscribed) return;
          
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying load attempt ${retryCount + 1}/${MAX_RETRIES}...`);
            retryCount++;
            clearTimeout(timeout);
            setTimeout(loadData, RETRY_DELAY);
            return;
          }
          
          console.warn('Loading timeout reached after retries, stopping load');
          setIsLoading(false);
          setFiles([]);
          setFolders([]);
          toast({
            title: "Loading timeout",
            description: "Unable to load files. Please check your connection and try refreshing.",
            variant: "error"
          });
        }, 5000); // 5 second timeout per attempt
        
        setLoadTimeout(timeout);
        
        // Check if user is authenticated
        if (!userId) {
          console.log('No user ID available, stopping load');
          clearTimeout(timeout);
          setFiles([]);
          setFolders([]);
          setIsLoading(false);
          return;
        }
        
        // Check if Supabase is properly configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Supabase configuration missing');
          toast({
            title: "Configuration Error",
            description: "Please configure Supabase environment variables in .env.local",
            variant: "error"
          });
          setFiles([]);
          setFolders([]);
          setIsLoading(false);
          return;
        }
        
        console.log('Loading data for user:', userId);
        
        // Determine which files to load based on the active tab
        let loadedFiles: FileItem[] = [];
        
        switch (activeTab) {
          case 'starred':
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null, true);
            break;
          case 'recent':
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null, false, 'recent');
            break;
          case 'uploads':
            // For now, this is the same as all files. In a real app, you'd filter by uploader
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null);
            break;
          case 'shared':
            // For now, return empty array. In a real app, you'd fetch shared files
            loadedFiles = [];
            break;
          case 'trash':
            // For now, return empty array. In a real app, you'd fetch deleted files
            loadedFiles = [];
            break;
          case 'all':
          default:
            loadedFiles = await getUserFiles(userId, currentFolder?.id || null);
            break;
        }
        
        // Load folders for current location
        const loadedFolders = await getUserFolders(userId, currentFolder?.id || null);
        
        console.log('Loaded files:', loadedFiles?.length || 0);
        console.log('Loaded folders:', loadedFolders?.length || 0);
        
        setFiles(loadedFiles || []);
        setFolders(loadedFolders || []);
        
        // Calculate storage used
        const totalStorage = (loadedFiles || []).reduce((total, file) => total + file.size, 0);
        setStorageUsed(totalStorage);
        
        // Clear timeout since we succeeded
        if (loadTimeout) {
          clearTimeout(loadTimeout);
          setLoadTimeout(null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Clear timeout
        if (loadTimeout) {
          clearTimeout(loadTimeout);
          setLoadTimeout(null);
        }
        // Set empty arrays to stop loading state
        setFiles([]);
        setFolders([]);
        toast({
          title: "Failed to load data",
          description: "Could not retrieve your files and folders. Please check your authentication and try again.",
          variant: "error"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Start loading data immediately when auth is ready
    loadData();
    
    return () => {
      isSubscribed = false;
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
    };
  }, [userId, currentFolder?.id, activeTab, authLoading]);

  // Add a retry button component
  const RetryButton = () => {
    const handleRetry = () => {
      setIsLoading(true);
      setFiles([]);
      setFolders([]);
      router.refresh(); // This will trigger a re-render and restart the loading process
    };

    return (
      <button
        onClick={handleRetry}
        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-md text-sm font-medium transition-colors"
      >
        Retry Loading
      </button>
    );
  };
  
  // Handle file upload
  const handleUploadFiles = async (uploadedFiles: File[]) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "error"
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      toast({
        title: "Configuration Error",
        description: "Supabase is not properly configured. Please check your environment variables.",
        variant: "error"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload files to Supabase storage one by one for better error handling
      const newFiles: FileItem[] = [];
      let failedUploads = 0;

      for (const file of uploadedFiles) {
        try {
          console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
          const newFile = await uploadFile(file, userId, currentFolder?.id || null);
          if (newFile) {
            console.log(`Successfully uploaded file:`, newFile);
            newFiles.push(newFile);
          } else {
            console.error(`Upload returned null for file: ${file.name}`);
            failedUploads++;
          }
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          failedUploads++;
        }
      }
      
      // Update state with successfully uploaded files
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        
        // Update storage used
        const additionalStorage = newFiles.reduce((total, file) => total + file.size, 0);
        setStorageUsed(prev => prev + additionalStorage);
        
        // Force a refresh of the folders in case new files were added to folders
        try {
          const refreshedFolders = await getUserFolders(userId, currentFolder?.id || null);
          setFolders(refreshedFolders || []);
        } catch (error) {
          console.error('Error refreshing folders after upload:', error);
        }
      }
      
      // Show appropriate success/error messages
      if (newFiles.length > 0 && failedUploads === 0) {
        toast({
          title: "Files uploaded successfully",
          description: `${newFiles.length} file(s) have been uploaded.`,
          variant: "success"
        });
      } else if (newFiles.length > 0 && failedUploads > 0) {
        toast({
          title: "Partial upload success",
          description: `${newFiles.length} file(s) uploaded, ${failedUploads} failed.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Upload failed",
          description: "All files failed to upload. Please try again.",
          variant: "error"
        });
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Check your connection and try again.",
        variant: "error"
      });
    } finally {
      setIsUploading(false);
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
  
  // Handle tab changes with feedback for empty sections
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Show helpful messages for empty sections
    if (tab === 'shared' && fileCounts.shared === 0) {
      toast({
        title: "No shared files",
        description: "Files shared with you will appear here."
      });
    } else if (tab === 'trash' && fileCounts.trash === 0) {
      toast({
        title: "Trash is empty",
        description: "Deleted files will appear here for 30 days."
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
  
  // Filter files based on searchQuery and active tab
  const filteredFiles = files.filter(file => {
    // First apply search filter
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Then apply tab-specific filters (these are already handled in the data loading)
    return true;
  });

  // Calculate file counts for sidebar (based on all files, not just filtered ones)
  const allFiles = files; // In a real app, you'd fetch all files regardless of current tab
  const fileCounts = {
    all: allFiles.length,
    starred: allFiles.filter(f => f.starred).length,
    recent: allFiles.filter(f => {
      // Files modified in last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(f.modified) > weekAgo;
    }).length,
    uploads: allFiles.length, // In a real app, filter by current user as uploader
    shared: 0, // Would be count of shared files
    trash: 0 // Would be count of deleted files
  };
  
  // Handle manual refresh
  const handleRefresh = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      
      // Reload files for current tab
      let refreshedFiles: FileItem[] = [];
      
      switch (activeTab) {
        case 'starred':
          refreshedFiles = await getUserFiles(userId, currentFolder?.id || null, true);
          break;
        case 'recent':
          refreshedFiles = await getUserFiles(userId, currentFolder?.id || null, false, 'recent');
          break;
        case 'uploads':
          refreshedFiles = await getUserFiles(userId, currentFolder?.id || null);
          break;
        case 'shared':
          refreshedFiles = [];
          break;
        case 'trash':
          refreshedFiles = [];
          break;
        default:
          refreshedFiles = await getUserFiles(userId, currentFolder?.id || null);
          break;
      }
      
      // Reload folders
      const refreshedFolders = await getUserFolders(userId, currentFolder?.id || null);
      
      setFiles(refreshedFiles || []);
      setFolders(refreshedFolders || []);
      
      // Recalculate storage
      const totalStorage = (refreshedFiles || []).reduce((total, file) => total + file.size, 0);
      setStorageUsed(totalStorage);
      
      toast({
        title: "Refreshed",
        description: "File list has been updated.",
        variant: "success"
      });
      
    } catch (error) {
      console.error('Error refreshing:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh the file list.",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  
  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-500/20 mx-auto"></div>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Initializing Optivus</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Setting up your workspace</p>
        </div>
      </div>
    );
  }

  // Show message if user is not authenticated (should be handled by ProtectedRoute)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Authentication Required</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar 
        storageUsed={storageUsed}
        folders={folders}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFolderClick={handleFolderClick}
        onCreateFolder={handleCreateFolder}
        onLogout={handleLogout}
        fileCounts={fileCounts}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateFolder={handleCreateFolder}
          onUploadFile={() => setShowUpload(true)}
          onRefresh={handleRefresh}
          currentFolder={currentFolder}
          onNavigateBack={handleNavigateBack}
          userAvatar={userAvatar}
          userName={userName}
          onLogout={handleLogout}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/30">
          <div className="max-w-7xl mx-auto space-y-6">
            {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
              <ConfigChecker />
            )}
            
            {isLoading && (
              <Card className="w-full border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <svg className="h-4 w-4 text-slate-600 dark:text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          Loading your files...
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          This may take a few moments
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {showUpload && (
              <FileUpload 
                onUploadFiles={handleUploadFiles}
                isUploading={isUploading}
                onClose={() => setShowUpload(false)}
              />
            )}
            
            <FileList 
              files={filteredFiles}
              isLoading={isLoading}
              onStarFile={handleStarFile}
              onDeleteFile={handleDeleteFile}
            />
          </div>
        </main>
      </div>
    </div>
  );
}