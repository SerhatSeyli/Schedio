"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { User, Settings, Moon, Sun, LogOut, Shield, Menu, Check, Briefcase, Clock, Building, Calendar, Bell, AlertTriangle, Mail, Phone, Camera, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BottomNav } from "@/components/bottom-nav"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { NotificationsPopover } from "@/components/notifications"
import { ProfileMenu } from "@/components/profile-menu"
import { useUserStore } from "@/store/user-store"
import { useSettingsStore } from "@/store/settings-store"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  
  // User store
  const { user, updateProfile, logout, isAuthenticated } = useUserStore()
  const [avatarSrc, setAvatarSrc] = useState<string>(user.avatar || "")  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [position, setPosition] = useState(user.position)
  const [department, setDepartment] = useState(user.department)
  const [employeeId, setEmployeeId] = useState(user.employeeId)
  
  // Settings store
  const { 
    notifications, 
    shiftPreferences, 
    updateNotifications, 
    updateShiftPreferences, 
    updateAppearance 
  } = useSettingsStore()
  
  const [notifyBeforeShift, setNotifyBeforeShift] = useState(notifications.beforeShift)
  const [notifyShiftChanges, setNotifyShiftChanges] = useState(notifications.shiftChanges)
  const [notifyRecurringEvents, setNotifyRecurringEvents] = useState(notifications.recurringEvents)
  const [emailNotifications, setEmailNotifications] = useState(notifications.emailNotifications)
  const [preferredShift, setPreferredShift] = useState(shiftPreferences.preferredShiftType)
  const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState(shiftPreferences.maxShiftsPerWeek.toString())
  const { theme, setTheme } = useTheme()
  
  // Sync state with store when it changes
  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setPosition(user.position)
    setDepartment(user.department)
    setEmployeeId(user.employeeId)
    setAvatarSrc(user.avatar || "")
  }, [user])
  
  useEffect(() => {
    setNotifyBeforeShift(notifications.beforeShift)
    setNotifyShiftChanges(notifications.shiftChanges)
    setNotifyRecurringEvents(notifications.recurringEvents)
    setEmailNotifications(notifications.emailNotifications)
  }, [notifications])
  
  useEffect(() => {
    setPreferredShift(shiftPreferences.preferredShiftType)
    setMaxShiftsPerWeek(shiftPreferences.maxShiftsPerWeek.toString())
  }, [shiftPreferences])

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name,
        email,
        phone,
        position,
        department,
        employeeId
      })
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved and synced to the cloud.",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile.",
        duration: 3000
      })
    }
  }
  
  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        duration: 3000
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out.",
        duration: 3000
      })
    }
  }

  const handleSavePreferences = () => {
    // Update notification settings
    updateNotifications({
      beforeShift: notifyBeforeShift,
      shiftChanges: notifyShiftChanges,
      recurringEvents: notifyRecurringEvents,
      emailNotifications: emailNotifications
    })
    
    // Update shift preferences
    updateShiftPreferences({
      preferredShiftType: preferredShift as "day" | "night" | "any",
      maxShiftsPerWeek: parseInt(maxShiftsPerWeek) || 5
    })
    
    // Update appearance settings
    updateAppearance({
      theme: theme as "light" | "dark" | "system"
    })
    
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated.",
      duration: 3000
    })
  }

  return (
    <div className="layout-container bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block sidebar-container border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>

      <div className="main-content flex flex-col min-h-screen overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="container flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-1.5 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Profile
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <ProfileMenu />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-6 overflow-y-auto pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card className="border-2 border-primary/5 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
                      <AvatarImage src={avatarSrc || "/placeholder.svg?height=80&width=80"} alt={name} />
                      <AvatarFallback className="text-lg bg-gradient-to-br from-primary/80 to-primary text-white">
                        {name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl font-bold">{name}</CardTitle>
                  <CardDescription className="text-sm">
                    <span className="inline-flex items-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {position}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">{department}</span>
                  </div>
                  <div className="flex items-center">
                    <Cloud className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm text-green-600 font-medium">
                      {isAuthenticated ? "Cloud Sync Enabled" : "Not Synced"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">ID: {employeeId}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // In a real app, you would upload this to a server
                        // For demo, we'll just use a local URL
                        const url = URL.createObjectURL(file)
                        setAvatarSrc(url)
                        updateProfile({ avatar: url })
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Settings Cards */}
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="personal" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="flex items-center gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Preferences</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-6">
                  {/* Personal Information */}
                  <Card className="border-2 border-primary/5 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="border-2 rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border-2 rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="border-2 rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="border-2 rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID</Label>
                          <Input
                            id="employeeId"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="border-2 rounded-lg h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select value={department} onValueChange={(value: string) => setDepartment(value)}>
                            <SelectTrigger className="border-2 rounded-lg h-11">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Security">Security</SelectItem>
                              <SelectItem value="Administration">Administration</SelectItem>
                              <SelectItem value="Medical">Medical</SelectItem>
                              <SelectItem value="Programs">Programs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSaveProfile} className="ml-auto">
                        <Check className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="preferences" className="space-y-6">
                  {/* Preferences */}
                  <Card className="border-2 border-primary/5 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        Preferences
                      </CardTitle>
                      <CardDescription>Manage your app preferences and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Notifications</h3>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-before-shift">Notify before shift</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Receive notifications 1 hour before your shift starts
                            </p>
                          </div>
                          <Switch
                            id="notify-before-shift"
                            checked={notifyBeforeShift}
                            onCheckedChange={setNotifyBeforeShift}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-shift-changes">Shift changes</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Receive notifications when your shifts are modified
                            </p>
                          </div>
                          <Switch
                            id="notify-shift-changes"
                            checked={notifyShiftChanges}
                            onCheckedChange={setNotifyShiftChanges}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Shift Preferences</h3>
                        <Separator />
                        <div className="space-y-2">
                          <Label htmlFor="preferred-shift">Preferred Shift Type</Label>
                          <Select value={preferredShift} onValueChange={(value: string) => setPreferredShift(value as "day" | "night" | "any")}>
                            <SelectTrigger className="border-2 rounded-lg h-11">
                              <SelectValue placeholder="Select preferred shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day Shift</SelectItem>
                              <SelectItem value="night">Night Shift</SelectItem>
                              <SelectItem value="any">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Appearance</h3>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Theme</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn("h-8 w-8 rounded-full", theme === "light" && "bg-primary/10 text-primary")}
                              onClick={() => setTheme("light")}
                            >
                              <Sun className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn("h-8 w-8 rounded-full", theme === "dark" && "bg-primary/10 text-primary")}
                              onClick={() => setTheme("dark")}
                            >
                              <Moon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleSavePreferences} className="ml-auto">
                        Save Preferences
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  {/* Account Security */}
                  <Card className="border-2 border-primary/5 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-500 dark:text-red-400">
                        <LogOut className="h-5 w-5 mr-2" />
                        Account Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button variant="destructive" className="w-full">
                        Sign Out
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="md:hidden sticky bottom-0 z-10 w-full">
          <BottomNav activePage="profile" />
        </div>
      </div>
    </div>
  )
}

function Mail({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function Phone({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function Camera({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}
