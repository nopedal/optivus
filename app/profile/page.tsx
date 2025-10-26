"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { User, Mail, Lock, Bell, Shield, HardDrive } from "lucide-react"

export default function ProfilePage() {
  const [profile] = useState({
    name: "User Name",
    email: "user@example.com",
    storageUsed: "45 GB",
    storageLimit: "100 GB",
    accountType: "Premium"
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Profile</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="p-6 md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <span className="text-2xl">{profile.name[0]}</span>
            </Avatar>
            <h2 className="text-xl font-semibold mb-2">{profile.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{profile.email}</p>
            <Badge variant="secondary" className="mb-4">
              {profile.accountType}
            </Badge>
            <div className="w-full">
              <div className="flex justify-between text-sm mb-2">
                <span>Storage Used</span>
                <span>{profile.storageUsed} / {profile.storageLimit}</span>
              </div>
              <Progress 
                value={(parseInt(profile.storageUsed) / parseInt(profile.storageLimit)) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-6">Profile Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="flex">
                <User className="w-4 h-4 mr-2 mt-3 text-muted-foreground" />
                <Input defaultValue={profile.name} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex">
                <Mail className="w-4 h-4 mr-2 mt-3 text-muted-foreground" />
                <Input defaultValue={profile.email} type="email" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex">
                <Lock className="w-4 h-4 mr-2 mt-3 text-muted-foreground" />
                <Input type="password" defaultValue="********" className="flex-1" />
              </div>
            </div>
            <Button className="w-full">Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}