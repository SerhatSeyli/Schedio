"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, AlertCircle, Info, Check, X, DollarSign, FileText, Trash2 } from "lucide-react"
import { format, isBefore, isAfter, addDays, differenceInDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Notification } from "@/lib/types"

interface NotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
  markAsRead: (id: string) => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  markAllAsRead: () => void
}

export function NotificationsPanel({
  open,
  onOpenChange,
  notifications,
  markAsRead,
  removeNotification,
  clearAllNotifications,
  markAllAsRead
}: NotificationsPanelProps) {
  // Use Sheet instead of Dialog for better mobile experience
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
      default:
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] max-h-[100vh] overflow-hidden flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-full">
              <Bell className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Notifications
            </span>
          </SheetTitle>
          <SheetDescription className="text-muted-foreground mt-1">
            Stay updated with your upcoming shifts and important events
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-b sticky top-0 z-10">
          <p className="text-sm font-medium">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Mark all read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
              className="text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear all
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                  <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">All Caught Up!</h3>
                <p className="text-muted-foreground max-w-xs">You don't have any notifications at the moment. We'll notify you when something important happens.</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 rounded-xl p-4 border transition-all hover:shadow-sm animate-in fade-in-50 duration-300",
                    notification.read
                      ? "bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800"
                      : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 shadow-sm"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full", {
                    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400": notification.type === "info",
                    "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400": notification.type === "upcoming",
                    "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400": notification.type === "changed",
                    "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400": notification.id.startsWith("payday"),
                    "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400": notification.id.startsWith("paycard"),
                  })}>
                    {getIconForType(notification)}
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "font-medium", 
                        notification.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {notification.timeAgo}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm", 
                      notification.read ? "text-muted-foreground" : "text-gray-600 dark:text-gray-300"
                    )}>
                      {notification.message}
                    </p>
                    
                    {notification.link && (
                      <a 
                        href={notification.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                        onClick={() => markAsRead(notification.id)}
                      >
                        {notification.id.startsWith("paycard") ? "Go to PSCClient" : "View details"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              ))
            )}
          </div>
        </ScrollArea>
        
        <SheetFooter className="p-6 border-t bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <Button 
            variant="default" 
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
          >
            Close Panel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
