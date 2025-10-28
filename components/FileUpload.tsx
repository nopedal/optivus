"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, Loader2, X, Check, AlertCircle, FileIcon, Image as ImageIcon, Film, Music } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FileUploadProps = {
  onUploadFiles?: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  maxSize?: number;
  onClose?: () => void;
};

const FileUpload = ({ 
  onUploadFiles, 
  isUploading = false,
  maxSize = 100 * 1024 * 1024, // 100MB default
  onClose
}: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => file.errors[0]?.message || 'Invalid file').join(', ');
      setErrorMessage(`Some files were rejected: ${errors}`);
    } else {
      setErrorMessage(null);
    }
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setUploadComplete(false);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
    onDrop,
    maxSize,
    multiple: true
  });

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Film className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploadProgress(0);
      setUploadComplete(false);
      
      // Start a fake progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const nextProgress = prev + Math.random() * 15;
          return nextProgress >= 90 ? 90 : nextProgress;
        });
      }, 150);
      
      // Actual upload
      if (onUploadFiles) {
        await onUploadFiles(selectedFiles);
      }
      
      // Complete progress and clean up
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);
      
      // Reset after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setSelectedFiles([]);
        setUploadComplete(false);
      }, 2500);
      
    } catch {
      setErrorMessage("Upload failed. Please try again.");
      setUploadProgress(0);
      setUploadComplete(false);
    }
  };
  
  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (isUploading || uploadProgress > 0) {
    return (
      <Card className="w-full border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800/80 dark:to-blue-900/10 backdrop-blur-sm shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            {uploadComplete ? (
              <>
                <div className="relative mb-6">
                  <div className="rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 ring-4 ring-green-200/50 dark:ring-green-800/50">
                    <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Upload complete!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Successfully uploaded {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} to your workspace
                </p>
              </>
            ) : (
              <>
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 h-16 w-16 rounded-2xl bg-blue-500/20 animate-ping" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Uploading files</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                  Processing {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} • {uploadProgress.toFixed(0)}% complete
                </p>
              </>
            )}
            <div className="w-full max-w-md">
              <Progress 
                value={uploadProgress} 
                className="h-3 bg-slate-200 dark:bg-slate-700"
                indicatorClassName={uploadComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}
              />
              <div className="flex justify-between mt-3 text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">
                  {uploadProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full">
      <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg overflow-hidden relative">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 shadow-sm"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
            isDragActive 
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 scale-[1.01] shadow-xl' 
              : isDragReject
              ? 'border-red-400 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} id="file-upload-input" />
          
          <div className={`rounded-2xl p-6 mb-6 transition-all duration-300 ${
            isDragActive 
              ? 'bg-blue-100 dark:bg-blue-900/40 ring-4 ring-blue-200/50 dark:ring-blue-800/50 scale-110' 
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}>
            <Upload 
              className={`h-12 w-12 transition-all duration-300 ${
                isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-500'
              }`} 
            />
          </div>
          
          <div className="text-center mb-6">
            <h3 className={`text-xl font-bold mb-2 transition-colors ${
              isDragActive 
                ? 'text-blue-700 dark:text-blue-300' 
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {isDragActive
                ? 'Drop your files here'
                : 'Upload your files'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Drag and drop files here, or{' '}
              <span className="font-medium text-blue-600 dark:text-blue-400">click to browse</span>
              {' '}your computer
            </p>
          </div>
          
          <div className="flex gap-3 items-center flex-wrap justify-center">
            <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 2.25h4.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Any file type
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Max {formatFileSize(maxSize)}
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
              <svg className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 0016.5 1.875h-1.875A3.375 3.375 0 0011.25 5.25v1.875a1.125 1.125 0 01-1.125 1.125H8.25A3.375 3.375 0 005.25 11.25v1.875" />
              </svg>
              Multiple files
            </Badge>
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 border-2 border-blue-400 rounded-xl bg-gradient-to-br from-blue-100/80 to-indigo-100/80 dark:from-blue-900/40 dark:to-indigo-900/40 backdrop-blur-sm animate-pulse" />
          )}
        </div>
      </Card>
      
      {errorMessage && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Upload Error</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <Card className="mt-4 border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ready to Upload
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedFiles.length} file(s) • {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedFiles([])}
                  className="text-xs"
                >
                  Clear All
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleUpload}
                  className="text-xs gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Upload {selectedFiles.length} File(s)
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {selectedFiles.map((file, index) => (
                <div 
                  key={`${file.name}-${index}`} 
                  className="flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 p-3 rounded-lg border border-border/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-md bg-primary/10 text-primary flex-shrink-0">
                      {getFileIcon(file)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs h-5 px-1.5">
                          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(index)} 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;