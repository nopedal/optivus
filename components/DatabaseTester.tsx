"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

const DatabaseTester = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isTestingShown, setIsTestingShown] = useState(false);
  const { user } = useAuth();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setResults([]);
    addResult('Starting database tests...');

    let retryCount = 0;
    const MAX_RETRIES = 3;

    const runTest = async () => {
      await testConnectionInternal();
    };

    const testConnectionInternal = async () => {
      try {
        // Test 1: Basic connection with timeout
        addResult('Testing basic connection...');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );
        const connectionPromise = supabase
          .from('files')
          .select('count')
          .limit(0);

        const result = await Promise.race([
          connectionPromise,
          timeoutPromise
        ]);
        
        const healthError = (result as { error?: Error })?.error;
      
        if (healthError) {
          const errorMessage = healthError?.message || 'Unknown error';
          if (retryCount < MAX_RETRIES && 
              (errorMessage.includes('timeout') || 
               errorMessage.includes('network') ||
               errorMessage.includes('connection'))) {
            retryCount++;
            addResult(`[RETRY] Connection failed, attempt ${retryCount}/${MAX_RETRIES}...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
            await runTest();
            return;
          }
          
          addResult(`[FAIL] Connection failed: ${errorMessage}`);
          if (errorMessage.includes('relation "files" does not exist')) {
            addResult('[FAIL] Files table does not exist. Please create it.');
          }
          return; // Exit early on error
        }
        
        addResult('[PASS] Connection successful');

        // Continue with remaining tests only if initial connection succeeds
        // Test 2: Auth status
        addResult(`User authenticated: ${user ? '[PASS] Yes' : '[FAIL] No'}`);
        if (user) {
          addResult(`User ID: ${user.id}`);
          addResult(`User email: ${user.email}`);
        }

        // Test 3: Try to create tables check
        addResult('Testing folders table...');
        const { error: foldersError } = await supabase
          .from('folders')
          .select('count')
          .limit(0);
        
        if (foldersError) {
          addResult(`[FAIL] Folders table error: ${foldersError.message}`);
        } else {
          addResult('[PASS] Folders table exists');
        }

        // Test 4: Storage bucket
        addResult('Testing storage bucket...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          addResult(`[FAIL] Storage error: ${bucketError.message}`);
        } else {
          const filesBucket = buckets?.find(b => b.name === 'files');
          if (filesBucket) {
            addResult('[PASS] Files bucket exists');
          } else {
            addResult('[FAIL] Files bucket does not exist');
            addResult(`Available buckets: ${buckets?.map(b => b.name).join(', ') || 'none'}`);
          }
        }
      } catch (error) {
        addResult(`[ERROR] Test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    try {
      await runTest();
    } catch (error) {
      addResult(`[ERROR] Test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (!isTestingShown) {
    return (
      <Card className="w-full border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M9.75 3.104L19.8 14.5m0 0l-5.25 5.25a2.25 2.25 0 01-1.591.659H11.25a2.25 2.25 0 01-1.591-.659L4.5 14.5m15.3 0a2.25 2.25 0 01-.659 1.591L13.8 21.35a2.25 2.25 0 01-1.591.659" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Having loading issues? Test your database connection.
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  We&apos;ll automatically retry loading a few times if there are connection issues.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTestingShown(true)}
              className="border-amber-300/50 text-amber-700 hover:bg-amber-100 dark:border-amber-600/50 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-all duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run Database Test
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            Database Connection Test
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testConnection}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              Run Test
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsTestingShown(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M9.75 3.104L19.8 14.5m0 0l-5.25 5.25a2.25 2.25 0 01-1.591.659H11.25a2.25 2.25 0 01-1.591-.659L4.5 14.5m15.3 0a2.25 2.25 0 01-.659 1.591L13.8 21.35a2.25 2.25 0 01-1.591.659" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Click &quot;Run Test&quot; to check your database connection</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`px-3 py-2 rounded-lg text-sm font-mono whitespace-pre-wrap ${
                    result.includes('[PASS]') 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      : result.includes('[FAIL]') || result.includes('[ERROR]')
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTester;