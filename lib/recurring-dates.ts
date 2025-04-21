import { addDays, format, addWeeks, isAfter, isBefore, startOfDay } from 'date-fns';

export interface RecurringEvent {
  id: string;
  title: string;
  type: 'payday' | 'paycard' | 'other';
  firstDate: Date;
  interval: number; // in weeks
  notes?: string;
  amount?: string; // for paydays
  destination?: string; // for paycards
}

export type RecurringEventType = RecurringEvent['type'];

/**
 * Generate occurrences of a recurring event within a range
 * @param event The recurring event definition
 * @param start Start date of the range
 * @param end End date of the range
 * @param limit Maximum number of occurrences to return
 * @returns Array of dates when this event occurs
 */
export function getRecurringEventDates(
  event: RecurringEvent,
  start: Date = new Date(),
  end: Date = addDays(new Date(), 90),
  limit: number = 10
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(event.firstDate);
  
  // Find the next occurrence from the start date
  while (isBefore(currentDate, start) && dates.length < limit) {
    currentDate = addWeeks(currentDate, event.interval);
  }
  
  // Generate occurrences until end date or limit
  while (isBefore(currentDate, end) && dates.length < limit) {
    dates.push(new Date(currentDate));
    currentDate = addWeeks(currentDate, event.interval);
  }
  
  return dates;
}

/**
 * Find the next occurrence of a recurring event after a reference date
 * @param event The recurring event definition
 * @param referenceDate Date to calculate the next occurrence from
 * @returns Date of the next occurrence
 */
export function getNextOccurrence(
  event: RecurringEvent,
  referenceDate: Date = new Date()
): Date {
  let currentDate = new Date(event.firstDate);
  
  // If reference date is after the first date, find the next occurrence
  if (isAfter(startOfDay(referenceDate), startOfDay(currentDate))) {
    while (isBefore(currentDate, referenceDate)) {
      currentDate = addWeeks(currentDate, event.interval);
    }
  }
  
  return currentDate;
}

/**
 * Format a recurring event for display
 * @param event The recurring event
 * @param referenceDate Optional reference date
 * @returns Formatted string description
 */
export function formatRecurringEvent(
  event: RecurringEvent,
  referenceDate: Date = new Date()
): string {
  const nextDate = getNextOccurrence(event, referenceDate);
  const formattedDate = format(nextDate, 'MMM d, yyyy');
  
  let description = '';
  
  switch (event.type) {
    case 'payday':
      description = `Payday on ${formattedDate}`;
      if (event.amount) {
        description += ` - $${event.amount}`;
      }
      break;
    case 'paycard':
      description = `Submit pay card on ${formattedDate}`;
      if (event.destination) {
        description += ` to ${event.destination}`;
      }
      break;
    default:
      description = `${event.title} on ${formattedDate}`;
  }
  
  return description;
}
