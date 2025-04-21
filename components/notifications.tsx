"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, AlertCircle, Info, Check, X, DollarSign, FileText, ChevronRight } from "lucide-react"
import { format, isBefore, isAfter, addDays, differenceInDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useShiftStore } from "@/lib/store"
import { getNextOccurrence, getRecurringEventDates } from "@/lib/recurring-dates"
import { NotificationsPanel } from "@/components/notifications-panel"
import { Notification } from "@/lib/types"

export function NotificationsPopover() {
  const { recurringEvents, shifts } = useShiftStore()
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "upcoming",
      title: "Upcoming Shift",
      message: "You have a Day Shift tomorrow at 07:00 AM in Main Building",
      timeAgo: "about 2 hours ago",
      read: false,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: "2",
      type: "changed",
      title: "Shift Changed",
      message: "Your shift on Friday has been changed from Night to Day",
      timeAgo: "about 5 hours ago",
      read: false,
      icon: <AlertCircle className="h-4 w-4" />
    },
    {
      id: "3",
      type: "info",
      title: "New Feature Available",
      message: "Check out the new statistics dashboard to track your work hours",
      timeAgo: "1 day ago",
      read: false,
      link: "/stats",
      icon: <Info className="h-4 w-4" />
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  // Generate notifications from recurring events
  useEffect(() => {
    if (recurringEvents.length === 0) return
    
    const now = new Date()
    const nextWeek = addDays(now, 7)
    const generatedNotifications: Notification[] = []
    
    // Create notifications for upcoming Pay Days
    const payDayEvents = recurringEvents.filter(e => e.type === 'payday')
    payDayEvents.forEach(event => {
      const nextDate = getNextOccurrence(event)
      const daysUntil = differenceInDays(nextDate, now)
      
      // Generate notification if the pay day is within the next 7 days
      if (daysUntil >= 0 && daysUntil <= 7) {
        generatedNotifications.push({
          id: `payday-${event.id}-${format(nextDate, 'yyyy-MM-dd')}`,
          type: 'upcoming',
          title: 'Upcoming Pay Day',
          message: `Pay Day on ${format(nextDate, 'EEEE, MMMM d')}${event.amount ? ` - $${event.amount}` : ''}`,
          timeAgo: `in ${daysUntil} days`,
          read: false,
          icon: <DollarSign className="h-4 w-4" />
        })
      }
    })
    
    // Create notifications for upcoming Pay Card submissions
    const payCardEvents = recurringEvents.filter(e => e.type === 'paycard')
    payCardEvents.forEach(event => {
      const nextDate = getNextOccurrence(event)
      const daysUntil = differenceInDays(nextDate, now)
      
      // Generate notification if the pay card submission is within the next 7 days
      if (daysUntil >= 0 && daysUntil <= 7) {
        generatedNotifications.push({
          id: `paycard-${event.id}-${format(nextDate, 'yyyy-MM-dd')}`,
          type: 'info',
          title: 'Submit Pay Card',
          message: `Remember to submit your pay card on ${format(nextDate, 'EEEE, MMMM d')} to PSCClient`,
          timeAgo: `in ${daysUntil} days`,
          read: false,
          link: 'https://pscclient.saskatchewan.ca',
          icon: <FileText className="h-4 w-4" />
        })
      }
    })
    
    // Merge generated notifications with existing ones (avoiding duplicates)
    const existingIds = notifications.map(n => n.id)
    const newNotifications = generatedNotifications.filter(n => !existingIds.includes(n.id))
    
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev])
    }
  }, [recurringEvents])
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getIconForType = (notification: Notification) => {
    // Use custom icon if provided
    if (notification.icon) {
      return notification.icon
    }
    
    // Otherwise use default icon based on type
    switch (notification.type) {
      case "upcoming":
        return <Calendar className="h-4 w-4" />
      case "changed":
        return <AlertCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[350px] p-0 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
          <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
            <h4 className="font-medium flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-1.5 rounded-full">
                <Bell className="h-4 w-4" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                Notifications
              </span>
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => setNotificationsPanelOpen(true)}
            >
              View all
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="max-h-[350px] overflow-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                  <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-sm font-medium mb-1">All Caught Up!</h3>
                <p className="text-xs text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 5).map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 border-b last:border-0 transition-colors",
                      !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-900/50"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full", {
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400": notification.type === "info",
                      "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400": notification.type === "upcoming",
                      "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400": notification.type === "changed",
                      "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400": notification.id.startsWith("payday"),
                      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400": notification.id.startsWith("paycard"),
                    })}>
                      {getIconForType(notification)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium", 
                          notification.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                          {notification.timeAgo}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs", 
                        notification.read ? "text-muted-foreground" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {notification.message}
                      </p>
                      
                      {notification.link && (
                        <a 
                          href={notification.link} 
                          className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          onClick={() => markAsRead(notification.id)}
                        >
                          {notification.id.startsWith("paycard") ? "Go to PSCClient" : "View details"}
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!notification.read && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {notifications.length > 5 && (
                  <div className="p-3 text-center border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() => setNotificationsPanelOpen(true)}
                    >
                      View all {notifications.length} notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer buttons are now handled in the notifications list */}
        </PopoverContent>
      </Popover>
      
      <NotificationsPanel
        open={notificationsPanelOpen}
        onOpenChange={setNotificationsPanelOpen}
        notifications={notifications}
        markAsRead={markAsRead}
        removeNotification={removeNotification}
        clearAllNotifications={clearAllNotifications}
        markAllAsRead={markAllAsRead}
      />
    </>
  )
}
