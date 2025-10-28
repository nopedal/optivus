"use client";

import React, { useState } from 'react';
import { 
  FileIcon, Star, Download, Trash2, MoreHorizontal, Loader2, 
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
      <Card className="w-full border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 rounded-full bg-blue-500/20 animate-ping" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Loading your files</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Fetching your content from the cloud</p>
          <div className="flex gap-2 mt-4">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (files.length === 0 && !isLoading) {
    return (
      <Card className="w-full border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800/80 dark:to-slate-900/50 backdrop-blur-sm shadow-lg">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <div className="relative mb-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 ring-1 ring-blue-200/50 dark:ring-blue-800/50">
              <svg className="h-12 w-12 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">Your workspace is ready</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md text-center mb-6 leading-relaxed">
            Start by uploading files using the dropzone above, or create folders to organize your content.
          </p>
          <div className="flex gap-3">
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Drag & Drop
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
              </svg>
              Click to Browse
            </Badge>
          </div>
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && (
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Configuration needed</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-0.5">Please set up your Supabase environment variables</p>
                </div>
              </div>
            </div>
          )}
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