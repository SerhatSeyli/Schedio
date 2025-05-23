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
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4 relative group">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg hover:border-primary/40 transition-all duration-300">
                      <AvatarImage src={avatarSrc || "/placeholder.svg?height=96&width=96"} alt={name} className="object-cover" />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/80 to-primary text-white">
                        {name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Change photo"
                    >

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
                          <Label htmlFor="theme">Theme</Label>
                          <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger id="theme">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">
                                <div className="flex items-center">
                                  <Sun className="h-4 w-4 mr-2" />
                                  Light
                                </div>
                              </SelectItem>
                              <SelectItem value="dark">
                                <div className="flex items-center">
                                  <Moon className="h-4 w-4 mr-2" />
                                  Dark
                                </div>
                              </SelectItem>
                              <SelectItem value="system">
                                <div className="flex items-center">
                                  <Settings className="h-4 w-4 mr-2" />
                                  System
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSavePreferences}>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
