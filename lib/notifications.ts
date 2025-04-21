import { messaging } from './firebase'
import { getToken, onMessage } from 'firebase/messaging'
import { useSettingsStore } from '@/store/settings-store'
import { useShiftStore } from '@/store/shift-store'
import { addDays, isSameDay, parseISO } from 'date-fns'

// Request permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null
    
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return null
    }
    
    // Get token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })
    
    return token
  } catch (error) {
    console.error('Error getting notification permission:', error)
    return null
  }
}

// Setup foreground message handler
export const setupMessageHandler = () => {
  if (!messaging) return
  
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload)
    
    // Create notification
    if (payload.notification) {
      const { title, body } = payload.notification
      
      // Show notification using the Notification API
      new Notification(title as string, {
        body: body as string,
        icon: '/logo192.png'
      })
    }
  })
}

// Check for upcoming shifts and send notifications if needed
export const checkForUpcomingShifts = () => {
  const { shifts } = useShiftStore.getState()
  const { notifications } = useSettingsStore.getState()
  
  if (!notifications.beforeShift) return
  
  const tomorrow = addDays(new Date(), 1)
  
  // Find shifts scheduled for tomorrow
  const tomorrowShifts = shifts.filter(shift => {
    const shiftDate = shift.date instanceof Date ? shift.date : parseISO(shift.date as string)
    return isSameDay(shiftDate, tomorrow)
  })
  
  // Send notifications for tomorrow's shifts
  if (tomorrowShifts.length > 0) {
    const title = 'Upcoming Shifts'
    const body = `You have ${tomorrowShifts.length} shift${tomorrowShifts.length > 1 ? 's' : ''} scheduled for tomorrow.`
    
    // Show notification using the Notification API if permission is granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo192.png'
      })
    }
  }
}

// Check for pay day and submit pay card events
export const checkForRecurringEvents = () => {
  const { recurringEvents } = useSettingsStore.getState()
  const { notifications } = useSettingsStore.getState()
  
  if (!notifications.recurringEvents) return
  
  const today = new Date()
  const tomorrow = addDays(today, 1)
  
  // Process each recurring event
  recurringEvents.forEach(event => {
    const eventDates = getRecurringEventDates(event, 30) // Get dates for next 30 days
    
    // Check if event occurs tomorrow
    const hasTomorrowEvent = eventDates.some(date => isSameDay(date, tomorrow))
    
    if (hasTomorrowEvent) {
      const title = `Reminder: ${event.title}`
      const body = event.type === 'payday' 
        ? `Tomorrow is pay day! Expected amount: $${event.amount}`
        : `Don't forget to submit your pay card tomorrow to ${event.destination}`
      
      // Show notification using the Notification API if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/logo192.png'
        })
      }
    }
  })
}

// Helper function to get dates for recurring events
const getRecurringEventDates = (event: any, daysAhead: number) => {
  const dates = []
  const startDate = event.firstDate instanceof Date ? event.firstDate : parseISO(event.firstDate)
  const endDate = addDays(new Date(), daysAhead)
  
  let currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    
    // Add interval weeks
    currentDate = addDays(currentDate, event.interval * 7)
  }
  
  return dates
}

// Initialize notifications system
export const initializeNotifications = async () => {
  // Request permission
  const token = await requestNotificationPermission()
  
  if (token) {
    // Setup message handler for foreground messages
    setupMessageHandler()
    
    // Set up daily checks
    setInterval(() => {
      checkForUpcomingShifts()
      checkForRecurringEvents()
    }, 86400000) // Check once per day (24 hours)
    
    // Also check immediately
    checkForUpcomingShifts()
    checkForRecurringEvents()
  }
  
  return token
}
