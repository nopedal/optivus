"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2, X, Check, AlertCircle, FileIcon, Image as ImageIcon, Film, Music } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FileUploadProps = {
  onUploadFiles?: (files: File[]) => Promise<void>;
  isUploading?: boolean;
  maxSize?: number;
};

const FileUpload = ({ 
  onUploadFiles, 
  isUploading = false,
  maxSize = 100 * 1024 * 1024 // 100MB default
}: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
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
      
    } catch (error) {
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
      <Card className="w-full mb-6 border-border/60 shadow-md bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {uploadComplete ? (
              <>
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-3">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Upload complete!</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) uploaded successfully
                </p>
              </>
            ) : (
              <>
                <div className="relative mb-3">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <div className="absolute inset-0 h-10 w-10 rounded-full bg-primary/20 animate-ping" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Uploading files...</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedFiles.length} file(s) • {uploadProgress.toFixed(0)}% complete
                </p>
              </>
            )}
            <div className="w-full mt-2">
              <Progress 
                value={uploadProgress} 
                className="h-2.5 bg-muted"
                indicatorClassName={uploadComplete ? 'bg-green-500' : 'bg-primary'}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full mb-6">
      <Card className="border-border/60 shadow-md overflow-hidden">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ease-in-out ${
            isDragActive 
              ? 'border-primary bg-primary/10 scale-[1.02]' 
              : isDragReject
              ? 'border-destructive bg-destructive/10'
              : 'border-border hover:border-primary hover:bg-primary/5 hover:shadow-lg'
          }`}
        >
          <input {...getInputProps()} id="file-upload-input" />
          
          <div className={`rounded-full p-4 mb-4 transition-all ${
            isDragActive 
              ? 'bg-primary/20 ring-4 ring-primary/20' 
              : 'bg-primary/10'
          }`}>
            <Upload 
              className={`h-10 w-10 transition-all ${
                isDragActive ? 'text-primary scale-110' : 'text-primary/70'
              }`} 
            />
          </div>
          
          <p className="text-center text-base font-semibold text-foreground mb-1">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here'}
          </p>
          <p className="text-center text-sm text-muted-foreground mb-3">
            or click to browse your computer
          </p>
          
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="text-xs">
              Any file type
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Max {formatFileSize(maxSize)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Multiple files
            </Badge>
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 border-2 border-primary rounded-lg bg-primary/5 animate-pulse" />
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