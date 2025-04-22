"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  Menu, 
  Check, 
  Briefcase, 
  Clock, 
  Building, 
  Calendar, 
  Bell, 
  AlertTriangle, 
  Mail, 
  Phone, 
  Camera, 
  Cloud,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

export function ProfilePageImproved() {
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
  const [center, setCenter] = useState(user.center || '')
  const [hourlyWage, setHourlyWage] = useState(user.hourlyWage || '')
  const [employmentStatus, setEmploymentStatus] = useState(user.employmentStatus || '')
  const [unit, setUnit] = useState(user.unit || '')
  
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
    setCenter(user.center || '')
    setHourlyWage(user.hourlyWage || '')
    setEmploymentStatus(user.employmentStatus || '')
    setUnit(user.unit || '')
    setAvatarSrc(user.avatar || "")
  }, [user])
  
  useEffect(() => {
    setNotifyBeforeShift(notifications.beforeShift)
    setNotifyShiftChanges(notifications.shiftChanges)
    setNotifyRecurringEvents(notifications.recurringEvents)
    setEmailNotifications(notifications.emailNotifications)
    setPreferredShift(shiftPreferences.preferredShiftType)
    setMaxShiftsPerWeek(shiftPreferences.maxShiftsPerWeek.toString())
  }, [notifications, shiftPreferences])
  
  // Function to handle profile image change
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarSrc(result)
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  // Function to trigger file input click
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }
  
  // Function to save profile data
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name,
        email,
        phone,
        position,
        department,
        employeeId,
        center,
        hourlyWage,
        employmentStatus,
        unit,
        avatar: avatarSrc
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
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        duration: 3000
      })
      router.push('/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        duration: 3000
      })
    }
  }
  
  // Save preferences
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
    // Fixed layout with no excess whitespace at the top
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
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

        {/* Main Content - Ensure it fills available space without extra whitespace */}
        <main className="flex-1 container py-6 overflow-y-auto pb-20 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card className="border-2 border-primary/5 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4 relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg hover:border-primary/40 transition-all duration-300">
                      <AvatarImage src={avatarSrc || "/placeholder.svg?height=96&width=96"} alt={name} className="object-cover" />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/80 to-primary text-white">
                        {name ? name.split(' ').map(n => n[0]).join('') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={handleImageClick}
                    >
                      <div className="bg-black/70 rounded-full p-2 cursor-pointer">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </div>
                  <CardTitle className="text-xl font-bold">{name || 'Your Name'}</CardTitle>
                  <CardDescription className="text-md">{position || 'Set your position'}</CardDescription>
                  
                  <div className="mt-3 flex justify-center">
                    <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                      <Building className="h-3 w-3" />
                      {department || 'Set Department'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </span>
                      <span className="font-medium">{email || 'Set your email'}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </span>
                      <span className="font-medium">{phone || 'Set your phone'}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        Employee ID
                      </span>
                      <span className="font-medium">{employeeId || 'Set ID'}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        Hourly Wage
                      </span>
                      <span className="font-medium">{hourlyWage ? `$${hourlyWage}` : 'Set wage'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={handleLogout} className="w-full text-destructive border-destructive/20 hover:bg-destructive/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Profile Form */}
            <div className="md:col-span-2">
              <Card className="border-2 border-primary/5 shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                      <User className="h-5 w-5" />
                    </div>
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Your full name" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Your email address"
                        type="email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="Your phone number"
                        type="tel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position" 
                        value={position} 
                        onChange={(e) => setPosition(e.target.value)} 
                        placeholder="Your job position"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input 
                        id="department" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        placeholder="Your department"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input 
                        id="employeeId" 
                        value={employeeId} 
                        onChange={(e) => setEmployeeId(e.target.value)} 
                        placeholder="Your employee ID"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="center">Center</Label>
                      <Input 
                        id="center" 
                        value={center} 
                        onChange={(e) => setCenter(e.target.value)} 
                        placeholder="Your center location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input 
                        id="unit" 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)} 
                        placeholder="Your unit"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyWage">Hourly Wage</Label>
                      <Input 
                        id="hourlyWage" 
                        value={hourlyWage} 
                        onChange={(e) => setHourlyWage(e.target.value)} 
                        placeholder="Your hourly wage"
                        type="number"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Select 
                        value={employmentStatus} 
                        onValueChange={setEmploymentStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>

              <div className="mt-6">
                <Card className="border-2 border-primary/5 shadow-md hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                        <Settings className="h-5 w-5" />
                      </div>
                      Preferences
                    </CardTitle>
                    <CardDescription>Customize your experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="notifications">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="shifts">Shift Preferences</TabsTrigger>
                      </TabsList>
                      <TabsContent value="notifications" className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-before-shift">Shift Reminders</Label>
                            <p className="text-sm text-muted-foreground">Get notified before your upcoming shifts</p>
                          </div>
                          <Switch 
                            id="notify-before-shift" 
                            checked={notifyBeforeShift}
                            onCheckedChange={setNotifyBeforeShift}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-shift-changes">Shift Changes</Label>
                            <p className="text-sm text-muted-foreground">Get notified when your shifts are modified</p>
                          </div>
                          <Switch 
                            id="notify-shift-changes" 
                            checked={notifyShiftChanges}
                            onCheckedChange={setNotifyShiftChanges}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-recurring-events">Pay Day & Pay Card Reminders</Label>
                            <p className="text-sm text-muted-foreground">Get notified about pay days and pay card submissions</p>
                          </div>
                          <Switch 
                            id="notify-recurring-events" 
                            checked={notifyRecurringEvents}
                            onCheckedChange={setNotifyRecurringEvents}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch 
                            id="email-notifications" 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="shifts" className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="preferred-shift">Preferred Shift Type</Label>
                          <Select 
                            value={preferredShift} 
                            onValueChange={(value: "day" | "night" | "any") => setPreferredShift(value)}
                          >
                            <SelectTrigger id="preferred-shift">
                              <SelectValue placeholder="Select preferred shift type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day Shift</SelectItem>
                              <SelectItem value="night">Night Shift</SelectItem>
                              <SelectItem value="any">No Preference</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max-shifts">Maximum Shifts Per Week</Label>
                          <Input 
                            id="max-shifts" 
                            type="number" 
                            min="1" 
                            max="7" 
                            value={maxShiftsPerWeek}
                            onChange={(e) => setMaxShiftsPerWeek(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Theme Preference</Label>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent" onClick={() => setTheme("light")}>
                              <div className="flex items-center space-x-3">
                                <Sun className="h-5 w-5 text-orange-500" />
                                <span>Light Mode</span>
                              </div>
                              {theme === "light" && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent" onClick={() => setTheme("dark")}>
                              <div className="flex items-center space-x-3">
                                <Moon className="h-5 w-5 text-blue-500" />
                                <span>Dark Mode</span>
                              </div>
                              {theme === "dark" && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent" onClick={() => setTheme("system")}>
                              <div className="flex items-center space-x-3">
                                <Settings className="h-5 w-5 text-gray-500" />
                                <span>System Default</span>
                              </div>
                              {theme === "system" && <Check className="h-5 w-5 text-primary" />}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
                      <Check className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
