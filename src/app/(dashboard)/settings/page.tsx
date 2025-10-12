
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

export default function SettingsPage() {
    const { setTheme, theme } = useTheme()
    const { toast } = useToast()
    const [profileUrl, setProfileUrl] = useState("https://images.unsplash.com/photo-1577333715735-8fcb0359d906?ixlib=rb-4.1.0&q=80&w=1080")
    const [name, setName] = useState("Aaditya Hande")
    const [email, setEmail] = useState("aadityahande@example.com")
    
    const handleSaveProfile = () => {
      // Validate profile URL
      if (profileUrl && !profileUrl.match(/^https:\/\/.+\.png$/i)) {
        toast({
          variant: "destructive",
          title: "Invalid Profile URL",
          description: "Please enter a valid HTTPS URL ending with .png",
        })
        return
      }
      
      toast({
        title: "✅ Profile Updated",
        description: "Your profile settings have been saved.",
      })
    }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileUrl} alt={name} />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Profile Picture Preview</p>
                <p className="text-xs text-muted-foreground">Use a .png image with HTTPS protocol</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="opacity-60"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileUrl">Profile Picture URL</Label>
              <Input 
                id="profileUrl" 
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
              <p className="text-xs text-muted-foreground">
                Must be a valid HTTPS URL ending with .png
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveProfile}>Save</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Select the theme for the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme} onValueChange={setTheme} className="grid sm:grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label htmlFor="light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Light
                </Label>
              </div>
               <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label htmlFor="dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    Dark
                </Label>
              </div>
               <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label htmlFor="system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    System
                </Label>
              </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
