"use client";

import React, { useState } from 'react';
import { 
  FileIcon, FolderIcon, Star, Download, Trash2, MoreHorizontal, Loader2, 
  FileImage, FileText, Film, Music, Archive, FileSpreadsheet, Presentation,
  ExternalLink, Copy, Share2, Eye
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type FileItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: Date | string;
  starred: boolean;
  path: string;
};

type FileListProps = {
  files: FileItem[];
  isLoading?: boolean;
  onStarFile?: (fileId: string, isStarred: boolean) => void;
  onDeleteFile?: (fileId: string, path: string) => void;
  onDownloadFile?: (fileId: string, path: string) => void;
};

const FileList = ({ 
  files, 
  isLoading = false,
  onStarFile,
  onDeleteFile,
  onDownloadFile
}: FileListProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'document': return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'video': return <Film className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-pink-500" />;
      case 'archive': return <Archive className="w-5 h-5 text-amber-500" />;
      case 'spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'presentation': return <Presentation className="w-5 h-5 text-orange-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      default: return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'image': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'document': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      'video': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      'audio': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      'archive': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      'spreadsheet': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'presentation': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      'pdf': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full border-border/60 shadow-md">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/20 animate-ping" />
          </div>
          <p className="text-lg font-semibold text-foreground">Loading your files...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait</p>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="w-full border-border/60 shadow-md bg-gradient-to-br from-card to-secondary/20">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <div className="rounded-full bg-primary/10 p-6 mb-4 ring-4 ring-primary/5">
            <FileIcon className="h-10 w-10 text-primary/70" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No files yet</h3>
          <p className="text-sm text-muted-foreground max-w-md text-center mb-4">
            Upload files using the dropzone above or create a new folder to organize your content.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Drag & Drop
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Click to Browse
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">
            {selectedFiles.length} file(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedFiles([])}>
              Clear
            </Button>
            <Button size="sm" variant="default">
              Download All
            </Button>
          </div>
        </div>
      )}

      <Card className="w-full overflow-hidden border-border/60 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 bg-secondary/30 hover:bg-secondary/30">
                <TableHead className="w-[45%] font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Size</TableHead>
                <TableHead className="font-semibold">Modified</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow 
                  key={file.id}
                  onMouseEnter={() => setHoveredFile(file.id)}
                  onMouseLeave={() => setHoveredFile(null)}
                  className="border-border/60 hover:bg-primary/5 transition-colors group"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {getFileIcon(file.type)}
                        {file.starred && (
                          <Star className="absolute -top-1 -right-1 h-3 w-3 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-xs group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                        {hoveredFile === file.id && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {file.path}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={`capitalize text-xs ${getFileTypeBadge(file.type)}`}
                    >
                      {file.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {formatFileSize(file.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(file.modified)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onStarFile?.(file.id, file.starred)}
                        className={`h-8 w-8 ${
                          file.starred 
                            ? 'text-amber-500 hover:text-amber-600' 
                            : 'text-muted-foreground hover:text-amber-500'
                        }`}
                        title={file.starred ? 'Remove star' : 'Star file'}
                      >
                        <Star className={`h-4 w-4 ${file.starred ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDownloadFile?.(file.id, file.path)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onStarFile?.(file.id, file.starred)}
                            className="cursor-pointer"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            {file.starred ? 'Remove star' : 'Star file'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Move to folder
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteFile?.(file.id, file.path)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
          <span>{files.length} file(s)</span>
          <span>Total size: {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}</span>
        </div>
      )}
    </div>
  );
};

export default FileList;