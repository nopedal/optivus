"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ConfigStatus = {
  envVars: boolean;
  supabaseConnection: boolean;
  filesTable: boolean;
  foldersTable: boolean;
  storage: boolean;
};

const ConfigChecker = () => {
  const [status, setStatus] = useState<ConfigStatus>({
    envVars: false,
    supabaseConnection: false,
    filesTable: false,
    foldersTable: false,
    storage: false
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkConfiguration = async () => {
    setIsChecking(true);
    const newStatus: ConfigStatus = {
      envVars: false,
      supabaseConnection: false,
      filesTable: false,
      foldersTable: false,
      storage: false
    };

    try {
      // Check environment variables
      newStatus.envVars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      if (newStatus.envVars) {
        // Check Supabase connection
        try {
          const { data, error } = await supabase.from('files').select('count').limit(1);
          newStatus.supabaseConnection = !error;
          newStatus.filesTable = !error;
        } catch (error) {
          console.error('Supabase connection error:', error);
        }

        // Check folders table
        try {
          const { data, error } = await supabase.from('folders').select('count').limit(1);
          newStatus.foldersTable = !error;
        } catch (error) {
          console.error('Folders table error:', error);
        }

        // Check storage
        try {
          const { data, error } = await supabase.storage.listBuckets();
          newStatus.storage = !error && data?.some(bucket => bucket.name === 'files');
        } catch (error) {
          console.error('Storage error:', error);
        }
      }
    } catch (error) {
      console.error('Configuration check error:', error);
    }

    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const getStatusIcon = (isOk: boolean) => {
    if (isOk) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isOk: boolean) => {
    return (
      <Badge variant={isOk ? "default" : "destructive"} className="text-xs">
        {isOk ? "OK" : "FAILED"}
      </Badge>
    );
  };

  const allGood = Object.values(status).every(s => s);

  return (
    <Card className="w-full mb-4 border-border/60 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Configuration Status</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConfiguration}
            disabled={isChecking}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            Check Again
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.envVars)}
              <span className="text-sm">Environment Variables</span>
            </div>
            {getStatusBadge(status.envVars)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.supabaseConnection)}
              <span className="text-sm">Supabase Connection</span>
            </div>
            {getStatusBadge(status.supabaseConnection)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.filesTable)}
              <span className="text-sm">Files Table</span>
            </div>
            {getStatusBadge(status.filesTable)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.foldersTable)}
              <span className="text-sm">Folders Table</span>
            </div>
            {getStatusBadge(status.foldersTable)}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.storage)}
              <span className="text-sm">Storage Bucket</span>
            </div>
            {getStatusBadge(status.storage)}
          </div>
        </div>

        {!allGood && (
          <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Some configuration issues were found. Please check the SETUP_GUIDE.md file for detailed instructions.
            </p>
          </div>
        )}

        {allGood && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ All configuration checks passed! Your app should work correctly.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigChecker;