"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, HardDrive, Mail, Moon, Sun, Globe, Lock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function SettingsPage() {
  const [settings] = useState({
    theme: "light",
    notifications: true,
    language: "English",
    twoFactor: false
  })

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Theme</label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {settings.theme === "light" ? (
                      <Sun className="h-4 w-4 mr-2" />
                    ) : (
                      <Moon className="h-4 w-4 mr-2" />
                    )}
                    {settings.theme === "light" ? "Light" : "Dark"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Sun className="h-4 w-4 mr-2" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Moon className="h-4 w-4 mr-2" /> Dark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <div className="flex-1">
                <label className="text-sm font-medium">Email Notifications</label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your account activity
                </p>
              </div>
              <Button variant="outline">
                {settings.notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <div className="flex-1">
                <label className="text-sm font-medium">Two-Factor Authentication</label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">
                {settings.twoFactor ? "Enabled" : "Setup"}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <div className="flex-1">
                <label className="text-sm font-medium">Change Password</label>
                <p className="text-sm text-muted-foreground">
                  Update your password regularly
                </p>
              </div>
              <Button variant="outline">Update</Button>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Language & Region</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <div className="flex-1">
                <label className="text-sm font-medium">Language</label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{settings.language}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Norwegian</DropdownMenuItem>
                  <DropdownMenuItem>Swedish</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}