'use client';

import React from 'react';
import { 
  Folder, Star, Clock, Upload, Users, Settings, LogOut, PlusSquare, Trash, Home,
  Files, Archive, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

type FolderItem = {
  id: string;
  name: string;
  fileCount: number;
};

type SidebarProps = {
  storageUsed: number;
  maxStorage?: number;
  folders?: FolderItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFolderClick: (folderId: string) => void;
  onCreateFolder?: () => void;
  onLogout?: () => void;
  fileCounts?: {
    all: number;
    starred: number;
    recent: number;
    uploads: number;
    shared: number;
    trash: number;
  };
};

const Sidebar = ({ 
  storageUsed, 
  maxStorage = 15 * 1024 * 1024 * 1024, // 15 GB default
  folders = [], 
  activeTab, 
  onTabChange,
  onFolderClick,
  onCreateFolder,
  onLogout,
  fileCounts = {
    all: 0,
    starred: 0,
    recent: 0,
    uploads: 0,
    shared: 0,
    trash: 0
  }
}: SidebarProps) => {
  const formatStorageUsed = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (storageUsed / maxStorage) * 100;
  
  const getProgressColor = () => {
    if (storagePercentage >= 90) return "bg-destructive";
    if (storagePercentage >= 75) return "bg-amber-500";
    return "bg-primary/80";
  };

  return (
    <div className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col h-full shadow-lg">
      <div className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center">
        <div className="h-9 w-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center mr-3 shadow-sm">
          <Home className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">Optivus</h1>
      </div>
      
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Main Menu
          </h2>
          
          <NavButton
            icon={Files}
            label="All Files"
            isActive={activeTab === 'all'}
            onClick={() => onTabChange('all')}
            count={fileCounts.all}
            iconColor="text-blue-600 dark:text-blue-400"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
          />
          
          <NavButton
            icon={Star}
            label="Starred"
            isActive={activeTab === 'starred'}
            onClick={() => onTabChange('starred')}
            count={fileCounts.starred}
            iconColor="text-yellow-500 dark:text-yellow-400"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
          />
          
          <NavButton
            icon={Clock}
            label="Recent"
            isActive={activeTab === 'recent'}
            onClick={() => onTabChange('recent')}
            count={fileCounts.recent}
            iconColor="text-green-600 dark:text-green-400"
            bgColor="bg-green-50 dark:bg-green-900/20"
          />
          
          <NavButton
            icon={Upload}
            label="My Uploads"
            isActive={activeTab === 'uploads'}
            onClick={() => onTabChange('uploads')}
            count={fileCounts.uploads}
            iconColor="text-purple-600 dark:text-purple-400"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
          
          <NavButton
            icon={Users}
            label="Shared"
            isActive={activeTab === 'shared'}
            onClick={() => onTabChange('shared')}
            count={fileCounts.shared}
            iconColor="text-indigo-600 dark:text-indigo-400"
            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
          />
          
          <NavButton
            icon={Trash}
            label="Trash"
            isActive={activeTab === 'trash'}
            onClick={() => onTabChange('trash')}
            count={fileCounts.trash}
            iconColor="text-red-500 dark:text-red-400"
            bgColor="bg-red-50 dark:bg-red-900/20"
          />
        </div>
        
        <div className="mt-8 space-y-4">
          <Card className="overflow-hidden border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-6 w-6 rounded-lg flex items-center justify-center",
                    storagePercentage >= 90 ? "bg-red-100 dark:bg-red-900/30" :
                    storagePercentage >= 75 ? "bg-yellow-100 dark:bg-yellow-900/30" :
                    "bg-blue-100 dark:bg-blue-900/30"
                  )}>
                    <Archive className={cn(
                      "h-3 w-3",
                      storagePercentage >= 90 ? "text-red-600 dark:text-red-400" :
                      storagePercentage >= 75 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-blue-600 dark:text-blue-400"
                    )} />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">Storage</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{formatFileSize(storageUsed)}</span>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={Math.min(storagePercentage, 100)} 
                  className="h-2 bg-slate-200 dark:bg-slate-700"
                  indicatorClassName={cn(
                    "transition-all duration-300",
                    storagePercentage >= 90 ? "bg-gradient-to-r from-red-500 to-red-600" :
                    storagePercentage >= 75 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
                    "bg-gradient-to-r from-blue-500 to-indigo-500"
                  )}
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{storagePercentage.toFixed(1)}% used</span>
                  <span>{formatFileSize(maxStorage)} total</span>
                </div>
              </div>
              {storagePercentage >= 80 && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-600"
                  >
                    <Shield className="h-3 w-3 mr-2" />
                    Upgrade Storage
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Folders
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={onCreateFolder}
              title="Create Folder"
            >
              <PlusSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="ghost"
                className="w-full justify-start text-sm h-10 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                onClick={() => onFolderClick(folder.id)}
              >
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 flex items-center justify-center mr-3 transition-colors">
                  <Folder className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="truncate flex-1 text-left text-slate-700 dark:text-slate-300">{folder.name}</span>
                {folder.fileCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs h-5 px-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                  >
                    {folder.fileCount > 99 ? '99+' : folder.fileCount}
                  </Badge>
                )}
              </Button>
            ))}
            
            {folders.length === 0 && (
              <div className="px-3 py-8 text-center">
                <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Folder className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  No folders yet
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={onCreateFolder}
                  className="h-auto p-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Create your first folder
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-slate-200/60 dark:border-slate-700/60">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm mb-2 h-10 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors"
        >
          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center mr-3 transition-colors">
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <span className="text-slate-700 dark:text-slate-300">Settings</span>
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm h-10 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors"
          onClick={onLogout}
        >
          <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 flex items-center justify-center mr-3 transition-colors">
            <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
          </div>
          <span className="text-slate-700 dark:text-slate-300 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">Log out</span>
        </Button>
      </div>
    </div>
  );
};

// Helper component for navigation buttons
interface NavButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  iconColor?: string;
  bgColor?: string;
}

const NavButton = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  count = 0, 
  iconColor = "text-slate-600 dark:text-slate-400",
  bgColor = "bg-slate-50 dark:bg-slate-800"
}: NavButtonProps) => {
  return (
    <Button 
      variant="ghost"
      className={cn(
        "w-full justify-start mb-1 group transition-all duration-200 h-11 px-3 rounded-xl",
        isActive ? 
          "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium shadow-sm" : 
          "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-200",
        isActive ? bgColor : "group-hover:" + bgColor
      )}>
        <Icon className={cn("w-4 h-4", isActive ? iconColor : iconColor + " group-hover:" + iconColor)} />
      </div>
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <Badge 
          variant="secondary" 
          className="text-xs h-5 px-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
        >
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </Button>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Sidebar;