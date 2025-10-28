"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { User, Mail, Lock, Bell, Shield, HardDrive, Edit, Save, X, Calendar, Globe, Phone } from "lucide-react"
import Header from "@/components/Header"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { toggleChat } = useChat()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    displayName: "",
    phone: "",
    bio: "",
    website: "",
    location: ""
  })

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setEditedProfile({
        displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        phone: user.user_metadata?.phone || "",
        bio: user.user_metadata?.bio || "",
        website: user.user_metadata?.website || "",
        location: user.user_metadata?.location || ""
      })
    }
  }, [user])

  const handleSave = async () => {
    // In a real app, you'd update the user profile in Supabase here
    console.log('Saving profile:', editedProfile)
    // For now, just close editing mode
    setIsEditing(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Mock storage data - in a real app, you'd fetch this from your backend
  const storageUsed = 245760000 // ~245 MB
  const storageLimit = 107374182400 // 100 GB
  const storagePercentage = (storageUsed / storageLimit) * 100

  const accountCreated = user?.created_at ? new Date(user.created_at) : new Date()
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          userName="Loading..."
          onSearchChange={() => {}}
          onToggleChat={toggleChat}
        />
        <div className="container mx-auto p-6">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    )
  }

  const userInitials = (editedProfile.displayName || user.email || "U")
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userName={editedProfile.displayName || user.email?.split('@')[0] || "User"}
        userAvatar={user.user_metadata?.avatar_url}
        onSearchChange={() => {}}
        onToggleChat={toggleChat}
        onLogout={signOut}
      />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  {user.user_metadata?.avatar_url ? (
                    <AvatarImage src={user.user_metadata.avatar_url} alt="Profile" />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isEditing ? (
                  <Input
                    value={editedProfile.displayName}
                    onChange={(e) => setEditedProfile({...editedProfile, displayName: e.target.value})}
                    placeholder="Display Name"
                    className="text-center font-semibold text-lg mb-2"
                  />
                ) : (
                  <h2 className="text-xl font-semibold mb-2">{editedProfile.displayName || "No name set"}</h2>
                )}
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                <Badge variant="secondary" className="mb-4">
                  <Shield className="h-3 w-3 mr-1" />
                  Free Plan
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Storage Used
                  </span>
                  <span>{formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}</span>
                </div>
                <Progress value={storagePercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(100 - storagePercentage).toFixed(1)}% remaining
                </p>
              </div>
              
              <div className="border-t border-border my-4" />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {accountCreated.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Last active {lastSignIn.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input value={user.email || ""} disabled className="bg-muted" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                        placeholder="Your phone number"
                      />
                    ) : (
                      <Input value={editedProfile.phone || "Not set"} disabled className="bg-muted" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website</label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {isEditing ? (
                      <Input
                        value={editedProfile.website}
                        onChange={(e) => setEditedProfile({...editedProfile, website: e.target.value})}
                        placeholder="https://your-website.com"
                      />
                    ) : (
                      <Input value={editedProfile.website || "Not set"} disabled className="bg-muted" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  {isEditing ? (
                    <Input
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile({...editedProfile, location: e.target.value})}
                      placeholder="City, Country"
                    />
                  ) : (
                    <Input value={editedProfile.location || "Not set"} disabled className="bg-muted" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border rounded-md resize-none h-24 bg-background"
                  />
                ) : (
                  <div className="p-3 border rounded-md bg-muted min-h-[96px]">
                    {editedProfile.bio || "No bio added yet."}
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Security Settings</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Email Notifications
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Marketing Emails
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border my-6" />
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}