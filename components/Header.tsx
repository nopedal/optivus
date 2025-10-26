'use client';

import React from 'react';
import { Search, Plus, Bell, ChevronLeft, FolderPlus, Upload, Settings, Menu, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreateFolder?: () => void;
  onUploadFile?: () => void;
  onRefresh?: () => void;
  currentFolder?: {
    id: string;
    name: string;
  } | null;
  onNavigateBack?: () => void;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
};

const Header = ({ 
  searchQuery = "",
  onSearchChange,
  onCreateFolder,
  onUploadFile,
  onRefresh,
  currentFolder,
  onNavigateBack,
  userAvatar,
  userName = "User",
  onLogout,
  onToggleSidebar
}: HeaderProps) => {
  const userInitials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
    
  return (
    <header className="sticky top-0 z-10 bg-card/70 dark:bg-card/70 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="flex items-center h-16 px-4 lg:px-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar}
          className="mr-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center flex-1 space-x-4">
          {currentFolder && onNavigateBack && (
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onNavigateBack} 
                className="mr-1 hover:bg-background"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-primary/70 mr-2" />
                <h2 className="text-lg font-medium truncate max-w-[200px]">
                  {currentFolder.name}
                </h2>
              </div>
            </div>
          )}
          
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              placeholder="Search files and folders..."
              className="pl-10 bg-background/90 border-border/60 focus-visible:ring-primary/30 h-9"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                className="bg-primary/10 hover:bg-primary/20 text-primary border-transparent"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/90 backdrop-blur-md border-border/60">
              <DropdownMenuItem 
                onClick={onCreateFolder}
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
              >
                <FolderPlus className="h-4 w-4 mr-2 text-primary/70" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem 
                onClick={onUploadFile}
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
              >
                <Upload className="h-4 w-4 mr-2 text-primary/70" />
                Upload Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            className="bg-background/50 border-border/60 hover:bg-background"
            title="Refresh files"
          >
            <RefreshCw className="h-4 w-4 text-foreground/70" />
          </Button>

          <Button
            variant="outline"
            className="bg-background/50 border-border/60 hover:bg-background hidden md:flex"
            onClick={() => window.location.href = '/dashboard'}
          >
            <LayoutDashboard className="h-4 w-4 mr-2 text-foreground/70" />
            Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative bg-background/50 border-border/60 hover:bg-background"
          >
            <Bell className="h-5 w-5 text-foreground/70" />
            <Badge 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-primary text-white border-card"
            >
              3
            </Badge>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="relative h-9 rounded-full bg-background/50 border-border/60 hover:bg-background"
              >
                <Avatar className="h-8 w-8">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 mt-1 bg-card/90 backdrop-blur-md border-border/60"
            >
              <div className="flex items-center p-2 border-b border-border/60">
                <Avatar className="h-10 w-10 mr-2">
                  {userAvatar ? (
                    <AvatarImage src={userAvatar} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">
                <Settings className="h-4 w-4 mr-2 text-primary/70" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">
                <Badge className="mr-2 bg-secondary text-primary font-normal text-xs py-0 h-4">PRO</Badge>
                Upgrade Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem 
                onClick={onLogout}
                className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

// Helper component for folder icon
const FolderIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

export default Header;