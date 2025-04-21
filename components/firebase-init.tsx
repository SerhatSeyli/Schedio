"use client"

import { useEffect } from 'react'
import { initializeNotifications } from '@/lib/notifications'
import { useUserStore } from '@/store/user-store'
import { useSettingsStore } from '@/store/settings-store'

export function FirebaseInit() {
  const { isAuthenticated } = useUserStore()
  const { notifications } = useSettingsStore()

  useEffect(() => {
    // Initialize push notifications if user is authenticated and has enabled them
    if (isAuthenticated && notifications.pushNotifications) {
      const initNotifications = async () => {
        try {
          await initializeNotifications()
          console.log('Push notifications initialized')
        } catch (error) {
          console.error('Failed to initialize push notifications:', error)
        }
      }
      
      initNotifications()
    }
  }, [isAuthenticated, notifications.pushNotifications])

  // This component doesn't render anything
  return null
}
