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
        employeeId,
        center,
        hourlyWage,
        employmentStatus,
        unit,
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
      // Show toast before logout to ensure it's visible
      toast({
        title: "Logging out",
        description: "You are being logged out...",
        duration: 2000
      })
      
      // Short delay to ensure toast is shown
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Perform logout (this will redirect to login page)
      await logout()
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar for larger screens */}
      <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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

        {/* Main Content */}
        <main className="flex-1 container py-6 overflow-y-auto pb-24 md:px-6">
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
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Change photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <CardTitle className="text-2xl font-bold">{name}</CardTitle>
                  <CardDescription className="text-sm flex flex-wrap justify-center gap-2 mt-1">
                    {position && (
                      <span className="inline-flex items-center bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {position}
                      </span>
                    )}
                    {(department || center) && (
                      <span className="inline-flex items-center bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                        <Building className="h-3 w-3 mr-1" />
                        {department || center}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-6">
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <Mail className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                        <div className="text-sm font-medium truncate">{email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <Phone className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                        <div className="text-sm font-medium">{phone || 'Not provided'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <Clock className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Employment Status</div>
                        <div className="text-sm font-medium">{employmentStatus || 'Not set'}</div>
                      </div>
                    </div>
                    
                    {unit && (
                      <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                        <AlertTriangle className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Unit</div>
                          <div className="text-sm font-medium">{unit}</div>
                        </div>
                      </div>
                    )}
                    
                    {hourlyWage && (
                      <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                        <DollarSign className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Hourly Wage</div>
                          <div className="text-sm font-medium">${hourlyWage}/hour</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center p-2 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                      <User className="h-5 w-5 mr-3 text-primary" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Employee ID</div>
                        <div className="text-sm font-medium">{employeeId}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <Cloud className="h-5 w-5 mr-3 text-green-500" />
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Cloud Status</div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">
                          {isAuthenticated ? "Cloud Sync Enabled" : "Not Synced"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2 pb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setAvatarSrc(result);
                          updateProfile({ avatar: result });
                          toast({
                            title: "Profile photo updated",
                            description: "Your profile photo has been changed successfully.",
                            duration: 3000
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Profile Settings */}
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position" 
                        value={position} 
                        onChange={(e) => setPosition(e.target.value)} 
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input 
                        id="employeeId" 
                        value={employeeId} 
                        onChange={(e) => setEmployeeId(e.target.value)} 
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Input 
                        id="unit" 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyWage">Hourly Wage ($)</Label>
                      <Input 
                        id="hourlyWage" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={hourlyWage} 
                        onChange={(e) => setHourlyWage(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Select 
                        value={employmentStatus} 
                        onValueChange={setEmploymentStatus}
                      >
                        <SelectTrigger id="employmentStatus">
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
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

{/* Bottom Navigation for Mobile */}
<div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
  <BottomNav />
</div>
</div>
</div>
