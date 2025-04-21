import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSettingsStore } from '@/store/settings-store'
import { useToast } from '@/components/ui/use-toast'
import { requestNotificationPermission, initializeNotifications } from '@/lib/notifications'
import { BellRing, Bell, BellOff } from 'lucide-react'

export function NotificationSettings() {
  const { notifications, updateNotifications } = useSettingsStore()
  const { toast } = useToast()
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')
  const [isInitializing, setIsInitializing] = useState(false)

  // Check notification permission on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  // Handle requesting notification permission
  const handleRequestPermission = async () => {
    setIsInitializing(true)
    try {
      const token = await requestNotificationPermission()
      
      if (token) {
        setPermissionStatus('granted')
        updateNotifications({ pushNotifications: true })
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive push notifications for important events.',
        })
        
        // Initialize notifications system
        await initializeNotifications()
      } else {
        setPermissionStatus('denied')
        updateNotifications({ pushNotifications: false })
        toast({
          variant: 'destructive',
          title: 'Notifications blocked',
          description: 'Please enable notifications in your browser settings.',
        })
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast({
        variant: 'destructive',
        title: 'Error enabling notifications',
        description: 'There was a problem enabling notifications.',
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Toggle notification settings
  const handleToggle = (key: keyof typeof notifications) => {
    updateNotifications({ [key]: !notifications[key] })
    
    // If enabling push notifications, request permission
    if (key === 'pushNotifications' && !notifications.pushNotifications) {
      handleRequestPermission()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure when and how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Permission */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-muted-foreground">
                {permissionStatus === 'granted'
                  ? 'Push notifications are enabled'
                  : permissionStatus === 'denied'
                  ? 'Push notifications are blocked by your browser'
                  : 'Enable push notifications to receive alerts'}
              </p>
            </div>
            {permissionStatus !== 'granted' ? (
              <Button 
                size="sm" 
                onClick={handleRequestPermission} 
                disabled={permissionStatus === 'denied' || isInitializing}
              >
                {isInitializing ? 'Enabling...' : 'Enable'}
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500">Enabled</span>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="beforeShift" className="flex flex-col gap-1">
              <span>Shift Reminders</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified before your upcoming shifts
              </span>
            </Label>
            <Switch
              id="beforeShift"
              checked={notifications.beforeShift}
              onCheckedChange={() => handleToggle('beforeShift')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="shiftChanges" className="flex flex-col gap-1">
              <span>Shift Changes</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified when your shifts are modified
              </span>
            </Label>
            <Switch
              id="shiftChanges"
              checked={notifications.shiftChanges}
              onCheckedChange={() => handleToggle('shiftChanges')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="recurringEvents" className="flex flex-col gap-1">
              <span>Pay Day & Pay Card Reminders</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified about pay days and when to submit pay cards
              </span>
            </Label>
            <Switch
              id="recurringEvents"
              checked={notifications.recurringEvents}
              onCheckedChange={() => handleToggle('recurringEvents')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="systemAnnouncements" className="flex flex-col gap-1">
              <span>System Announcements</span>
              <span className="font-normal text-sm text-muted-foreground">
                Get notified about system updates and announcements
              </span>
            </Label>
            <Switch
              id="systemAnnouncements"
              checked={notifications.systemAnnouncements}
              onCheckedChange={() => handleToggle('systemAnnouncements')}
            />
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Methods</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="flex flex-col gap-1">
              <span>Email Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications via email
              </span>
            </Label>
            <Switch
              id="emailNotifications"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="pushNotifications" className="flex flex-col gap-1">
              <span>Browser Notifications</span>
              <span className="font-normal text-sm text-muted-foreground">
                Receive notifications in your browser
              </span>
            </Label>
            <Switch
              id="pushNotifications"
              checked={notifications.pushNotifications}
              disabled={permissionStatus === 'denied'}
              onCheckedChange={() => handleToggle('pushNotifications')}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
