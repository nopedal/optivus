'use client';

import React from 'react';
import { 
  Folder, Star, Clock, Upload, Users, Settings, LogOut, PlusSquare, Trash, Home 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
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
};

const Sidebar = ({ 
  storageUsed, 
  maxStorage = 15 * 1024 * 1024 * 1024, // 15 GB default
  folders = [], 
  activeTab, 
  onTabChange,
  onFolderClick,
  onCreateFolder,
  onLogout
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
    <div className="w-64 bg-card/60 dark:bg-card/60 backdrop-blur-sm border-r border-border/60 flex flex-col h-full shadow-md">
      <div className="p-5 border-b border-border/60 flex items-center">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
          <Home className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Optivus</h1>
      </div>
      
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Main Menu
          </h2>
          
          <NavButton
            icon={Folder}
            label="All Files"
            isActive={activeTab === 'all'}
            onClick={() => onTabChange('all')}
          />
          
          <NavButton
            icon={Star}
            label="Starred"
            isActive={activeTab === 'starred'}
            onClick={() => onTabChange('starred')}
          />
          
          <NavButton
            icon={Clock}
            label="Recent"
            isActive={activeTab === 'recent'}
            onClick={() => onTabChange('recent')}
          />
          
          <NavButton
            icon={Upload}
            label="My Uploads"
            isActive={activeTab === 'uploads'}
            onClick={() => onTabChange('uploads')}
          />
          
          <NavButton
            icon={Users}
            label="Shared"
            isActive={activeTab === 'shared'}
            onClick={() => onTabChange('shared')}
          />
          
          <NavButton
            icon={Trash}
            label="Trash"
            isActive={activeTab === 'trash'}
            onClick={() => onTabChange('trash')}
          />
        </div>
        
        <div className="mt-8 space-y-4">
          <Card className="overflow-hidden border-border/60 bg-secondary/50 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/80 font-medium">Storage</span>
                <span className="font-semibold">{formatFileSize(storageUsed)}</span>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={Math.min(storagePercentage, 100)} 
                  className="h-2.5 bg-muted"
                  indicatorClassName={cn(
                    "transition-all",
                    getProgressColor()
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{storagePercentage.toFixed(1)}% used</span>
                  <span>{formatFileSize(maxStorage)} total</span>
                </div>
              </div>
              <div className="pt-1">
                <Button variant="secondary" size="sm" className="w-full text-xs bg-background/80 hover:bg-background">
                  Upgrade Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Folders
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-primary/10"
              onClick={onCreateFolder}
              title="Create Folder"
            >
              <PlusSquare className="h-4 w-4 text-primary" />
            </Button>
          </div>
          
          <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant="ghost"
                className="w-full justify-start text-sm h-9 px-3 hover:bg-primary/5"
                onClick={() => onFolderClick(folder.id)}
              >
                <Folder className="w-4 h-4 mr-2 text-primary/70" />
                <span className="truncate flex-1 text-left">{folder.name}</span>
                {folder.fileCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground ml-1">
                    {folder.fileCount}
                  </span>
                )}
              </Button>
            ))}
            
            {folders.length === 0 && (
              <div className="px-3 py-6 text-center">
                <p className="text-xs text-muted-foreground">
                  No folders yet
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={onCreateFolder}
                  className="mt-1 h-auto p-0 text-xs text-primary"
                >
                  Create your first folder
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-border/60">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm mb-2 hover:bg-primary/5"
        >
          <Settings className="w-4 h-4 mr-3 text-primary/70" />
          Settings
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sm hover:bg-primary/5"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-3 text-primary/70" />
          Log out
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
}

const NavButton = ({ icon: Icon, label, isActive, onClick }: NavButtonProps) => {
  return (
    <Button 
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start mb-1 group transition-all",
        isActive ? 
          "bg-primary/10 text-primary font-medium" : 
          "hover:bg-primary/5 text-foreground/80"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "mr-3 transition-all",
        isActive ? "text-primary" : "text-primary/70 group-hover:text-primary/90"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      {label}
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