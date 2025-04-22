"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { Shield, Bell, Clock, Sun, MoonStar, Smartphone, Globe, Lock, DollarSign, FileText, Calendar, Cloud } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/sidebar"
import { NotificationsPopover } from "@/components/notifications"
import { ProfileMenu } from "@/components/profile-menu"
import { BottomNav } from "@/components/bottom-nav"
import { useShiftStore } from "@/store/shift-store"
import { useSettingsStore } from "@/store/settings-store"
import { useUserStore } from "@/store/user-store"
import { getNextOccurrence } from "@/lib/recurring-dates"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { recurringEvents, addRecurringEvent } = useSettingsStore()
  const { syncShiftsToCloud, loading: shiftSyncLoading } = useShiftStore()
  const { isAuthenticated } = useUserStore()
  const [autoTimeZone, setAutoTimeZone] = useState(true)
  const [syncInProgress, setSyncInProgress] = useState(false)
  
  // Pay Day state
  const [isPayDayActive, setIsPayDayActive] = useState(() => {
    return recurringEvents.some(e => e.type === 'payday')
  })
  
  // Submit Pay Card state
  const [isPayCardActive, setIsPayCardActive] = useState(() => {
    return recurringEvents.some(e => e.type === 'paycard')
  })
  
  const handlePayDayToggle = (checked: boolean) => {
    setIsPayDayActive(checked)
    
    if (checked && !recurringEvents.some(e => e.type === 'payday')) {
      // Add new recurring pay day event
      const newEvent = {
        id: `payday-${Date.now()}`,
        title: 'Pay Day',
        type: 'payday' as const,
        firstDate: new Date('2025-04-25'),
        interval: 2, // biweekly
        amount: '2500.00'
      }
      
      addRecurringEvent(newEvent)
    }
  }
  
  const handlePayCardToggle = (checked: boolean) => {
    setIsPayCardActive(checked)
    
    if (checked && !recurringEvents.some(e => e.type === 'paycard')) {
      // Add new recurring pay card event
      const newEvent = {
        id: `paycard-${Date.now()}`,
        title: 'Submit Pay Card',
        type: 'paycard' as const,
        firstDate: new Date('2025-05-01'),
        interval: 2, // biweekly
        destination: 'PSCClient',
        notes: 'Submit to https://pscclient.saskatchewan.ca'
      }
      
      addRecurringEvent(newEvent)
    }
  }
  
  const getNextPayDay = () => {
    const payDayEvent = recurringEvents.find(e => e.type === 'payday')
    return payDayEvent 
      ? format(getNextOccurrence(payDayEvent), 'MMM dd, yyyy')
      : 'Apr 25, 2025'
  }
  
  const getNextPayCard = () => {
    const payCardEvent = recurringEvents.find(e => e.type === 'paycard')
    return payCardEvent 
      ? format(getNextOccurrence(payCardEvent), 'MMM dd, yyyy')
      : 'May 01, 2025'
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
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
                    <Shield className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <Sidebar />
                </SheetContent>
              </Sheet>

              <h1 className="text-xl font-bold">Settings</h1>
            </div>

            <div className="flex items-center gap-3">
              <NotificationsPopover />
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1 container py-6 space-y-6 overflow-y-auto pb-20">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick-access" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Access Features</CardTitle>
                  <CardDescription>
                    Quickly enable or disable special features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Pay Day</p>
                          <p className="text-sm text-muted-foreground">Next: {getNextPayDay()}</p>
                        </div>
                      </div>
                      <Switch id="payday-mobile" checked={isPayDayActive} onCheckedChange={handlePayDayToggle} />
                    </div>

                    <div className="flex items-center justify-between border p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Submit Pay Card</p>
                          <p className="text-sm text-muted-foreground">Next: {getNextPayCard()}</p>
                          {isPayCardActive && (
                            <a 
                              href="https://pscclient.saskatchewan.ca" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              https://pscclient.saskatchewan.ca
                            </a>
                          )}
                        </div>
                      </div>
                      <Switch id="paycard-mobile" checked={isPayCardActive} onCheckedChange={handlePayCardToggle} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Theme</CardTitle>
                  <CardDescription>
                    Customize how Schedio looks on your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Theme</Label>
                    <RadioGroup defaultValue={theme} onValueChange={setTheme} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex items-center gap-2">
                          <Sun className="h-4 w-4" /> Light
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark" className="flex items-center gap-2">
                          <MoonStar className="h-4 w-4" /> Dark
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system" className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" /> System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Reset to Default
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Display</CardTitle>
                  <CardDescription>
                    Customize how content is displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-view">Compact View</Label>
                    <Switch id="compact-view" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">Large Text</Label>
                    <Switch id="large-text" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Switch id="high-contrast" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
              
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5" />
                      Cloud Sync
                    </CardTitle>
                    <CardDescription>
                      Manage your data synchronization with the cloud
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Sync Shifts to Cloud</h4>
                            <p className="text-sm text-muted-foreground">
                              Manually sync all your shifts to the cloud storage
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={async () => {
                              setSyncInProgress(true);
                              await syncShiftsToCloud();
                              setSyncInProgress(false);
                            }} 
                            disabled={syncInProgress || shiftSyncLoading}
                          >
                            {(syncInProgress || shiftSyncLoading) ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Syncing...
                              </>
                            ) : "Sync Now"}
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last synced: {new Date().toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6 pb-24">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-col items-center sm:items-start gap-4">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src="/placeholder.svg?height=80&width=80" alt="User" />
                        <AvatarFallback className="text-lg">JD</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First Name</Label>
                          <Input id="first-name" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last Name</Label>
                          <Input id="last-name" defaultValue="Doe" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job-title">Job Title</Label>
                        <Input id="job-title" defaultValue="Correctional Officer" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button className="w-full sm:w-auto">Save Changes</Button>
                  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Time Zone</CardTitle>
                  <CardDescription>
                    Set your time zone for proper shift scheduling
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-timezone">Auto-detect Time Zone</Label>
                    <Switch 
                      id="auto-timezone" 
                      checked={autoTimeZone}
                      onCheckedChange={setAutoTimeZone}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select disabled={autoTimeZone} defaultValue="America/Denver">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>North America</SelectLabel>
                          <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                          <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Lock className="h-4 w-4 mr-2" /> Change Password
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Switch id="two-factor" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="session-timeout">Automatic Logout After Inactivity</Label>
                    <Switch id="session-timeout" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive">Delete Account</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden">
          <BottomNav activePage="profile" />
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
