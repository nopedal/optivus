"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import FileList from "@/components/FileList"
import { useEffect, useState } from "react"
import { Upload, Download, Users, HardDrive, FileImage, FileText, Film, Music, ArrowLeft } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { getUserFiles, getUserFolders, FileItem } from "@/lib/supabase"
import Link from "next/link"
import Header from "@/components/Header"
import { useRouter } from "next/navigation"
import { useChat } from '@/contexts/chat-context'

interface StorageCategory {
  type: string
  size: number
  icon: any
  extensions: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { toggleChat } = useChat()
  const [storageStats, setStorageStats] = useState({
    total: 100 * 1024 * 1024 * 1024, // 100 GB in bytes
    used: 0,
    breakdown: [
      { type: 'Images', size: 0, icon: FileImage, extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { type: 'Documents', size: 0, icon: FileText, extensions: ['pdf', 'doc', 'docx', 'txt'] },
      { type: 'Videos', size: 0, icon: Film, extensions: ['mp4', 'mov', 'avi'] },
      { type: 'Music', size: 0, icon: Music, extensions: ['mp3', 'wav', 'ogg'] },
    ]
  })

  const [quickStats, setQuickStats] = useState({
    totalFiles: 0,
    downloads: 0,
    uploads: 0,
    sharedFiles: 0
  })

  const [files, setFiles] = useState([
    {
      id: "1",
      name: "document.pdf",
      type: "pdf",
      size: 2621440, // 2.5 MB in bytes
      modified: new Date().toISOString(),
      shared: false,
      starred: false,
      path: "/documents/document.pdf"
    },
    {
      id: "2",
      name: "image.jpg",
      type: "image",
      size: 1887436, // 1.8 MB in bytes
      modified: new Date().toISOString(),
      shared: true,
      starred: true,
      path: "/images/image.jpg"
    }
  ])
  useEffect(() => {
    const loadData = async () => {
      try {
        const userFiles = await getUserFiles('')
        const userFolders = await getUserFolders('')
        
        setFiles(userFiles)
        
        // Calculate storage stats
        let totalSize = 0
        const newBreakdown = storageStats.breakdown.map(category => ({
          ...category,
          size: 0
        }))
        
        userFiles.forEach(file => {
          totalSize += file.size
          const ext = file.name.split('.').pop()?.toLowerCase() || ''
          
          newBreakdown.forEach(category => {
            if (category.extensions.includes(ext)) {
              category.size += file.size
            }
          })
        })
        
        setStorageStats(prev => ({
          ...prev,
          used: totalSize,
          breakdown: newBreakdown
        }))
        
        // Update quick stats
        setQuickStats({
          totalFiles: userFiles.length,
          downloads: userFiles.reduce((acc, f) => acc + (f.downloads || 0), 0),
          uploads: userFiles.length,
          sharedFiles: userFiles.filter(f => f.shared).length
        })
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName="User"
        onSearchChange={(q) => console.log(q)}
        onToggleChat={toggleChat}
      />
      
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Files
          </Button>
        </div>
      
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-2xl font-semibold">{quickStats.totalFiles}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-semibold">{quickStats.downloads}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uploads</p>
                <p className="text-2xl font-semibold">{quickStats.uploads}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-secondary rounded-full">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shared Files</p>
                <p className="text-2xl font-semibold">{quickStats.sharedFiles}</p>
              </div>
            </div>
          </Card>
      </div>
      
      {/* Storage Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4">Storage Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Used Space</span>
                <span className="text-sm font-medium">
                  {(storageStats.used / (1024 * 1024 * 1024)).toFixed(2)}GB of {(storageStats.total / (1024 * 1024 * 1024)).toFixed(0)}GB
                </span>
              </div>
              <Progress 
                value={(storageStats.used / storageStats.total) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {storageStats.breakdown.map((item, index) => {
                const Icon = item.icon
                const sizeGB = (item.size / (1024 * 1024 * 1024)).toFixed(2)
                const percentage = ((item.size / storageStats.total) * 100).toFixed(1)
                return (
                  <div key={index} className="flex items-center space-x-3 group cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors duration-200">
                    <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm group-hover:text-primary transition-colors duration-200">{item.type}</span>
                        <span className="text-sm font-medium">{sizeGB}GB</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={parseFloat(percentage)} 
                          className="h-1 mt-1 flex-1" 
                        />
                        <span className="text-xs text-muted-foreground">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="w-full justify-start hover:scale-105 transition-transform duration-200" 
              variant="outline"
              onClick={() => router.push('/?upload=true')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button 
              className="w-full justify-start hover:scale-105 transition-transform duration-200" 
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
            <Button 
              className="w-full justify-start hover:scale-105 transition-transform duration-200" 
              variant="outline"
            >
              <Users className="mr-2 h-4 w-4" />
              Share Files
            </Button>
            <Button 
              className="w-full justify-start hover:scale-105 transition-transform duration-200" 
              variant="outline"
              onClick={() => router.push('/settings')}
            >
              <HardDrive className="mr-2 h-4 w-4" />
              Storage Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Files */}
      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Files</h2>
          <Button 
            variant="outline"
            className="hover:scale-105 transition-transform duration-200"
            onClick={() => router.push('/')}
          >
            View All Files
          </Button>
        </div>
        <div className="overflow-hidden">
          <FileList files={files.slice(0, 5)} />
        </div>
      </Card>
    </div>
  </div>
)}