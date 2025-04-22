"use client"

import { useState } from "react"
import { useSidebar } from "./sidebar-provider"
import { useRouter, usePathname } from "next/navigation"
import { 
  CalendarIcon, 
  Home, 
  BarChart3, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  ArrowLeftToLine,
  ArrowRightToLine,
  UserCircle2,
  Bell,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useShiftStore } from "@/store/shift-store"
import { useUserStore } from "@/store/user-store"
import { Shift, ShiftType } from "@/store/shift-store"
import { format, isAfter, addDays, parseISO, isValid } from "date-fns"

interface SidebarProps {}

export function Sidebar({}: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { shifts } = useShiftStore()
  const { user } = useUserStore()
  const { expanded, toggleSidebar } = useSidebar()
  const [upcomingShiftsExpanded, setUpcomingShiftsExpanded] = useState(true)
  
  const isActivePath = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }
  
  // Get upcoming shifts for the next few days
  const getUpcomingShifts = (shifts: Shift[], limit: number): Shift[] => {
    const today = new Date();
    return shifts
      .filter(shift => {
        const shiftDate = typeof shift.date === 'string' ? 
          (isValid(new Date(shift.date)) ? new Date(shift.date) : new Date()) : 
          new Date(shift.date);
        return isAfter(shiftDate, today) && !shift.completed;
      })
      .sort((a, b) => {
        const dateA = typeof a.date === 'string' ? 
          (isValid(new Date(a.date)) ? new Date(a.date) : new Date()) : 
          new Date(a.date);
        const dateB = typeof b.date === 'string' ? 
          (isValid(new Date(b.date)) ? new Date(b.date) : new Date()) : 
          new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, limit);
  }

  // Format shift date for display
  const formatShiftDate = (date: string | Date): string => {
    const shiftDate = typeof date === 'string' ? 
      (isValid(new Date(date)) ? new Date(date) : new Date()) : 
      new Date(date);
    
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (shiftDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (shiftDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(shiftDate, 'MMM d');
    }
  }

  // Get color based on shift type
  const getShiftTypeColor = (type: ShiftType): string => {
    switch (type) {
      case 'day': return 'bg-yellow-500/10 text-yellow-500';
      case 'night': return 'bg-blue-500/10 text-blue-500';
      case 'overtime': return 'bg-orange-500/10 text-orange-500';
      case 'sick': return 'bg-red-500/10 text-red-500';
      case 'vacation': return 'bg-purple-500/10 text-purple-500';
      case 'meeting': return 'bg-green-500/10 text-green-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  }

  // Get icon based on shift type
  const getShiftTypeIcon = (type: ShiftType) => {
    switch (type) {
      case 'day': return <Sun className="h-3.5 w-3.5" />;
      case 'night': return <Moon className="h-3.5 w-3.5" />;
      case 'overtime': return <Clock className="h-3.5 w-3.5" />;
      case 'sick': return <User className="h-3.5 w-3.5" />;
      case 'vacation': return <Calendar className="h-3.5 w-3.5" />;
      case 'meeting': return <Users className="h-3.5 w-3.5" />;
      default: return <Calendar className="h-3.5 w-3.5" />;
    }
  }

  // Get label based on shift type
  const getShiftTypeLabel = (type: ShiftType): string => {
    switch (type) {
      case 'day': return 'Day Shift';
      case 'night': return 'Night Shift';
      case 'overtime': return 'Overtime';
      case 'sick': return 'Sick Leave';
      case 'vacation': return 'Vacation';
      case 'meeting': return 'Meeting';
      default: return type;
    }
  }

  // Get upcoming shifts
  const upcomingShifts = getUpcomingShifts(shifts, 3);

  return (
    <div 
      className={`h-full flex flex-col transition-all duration-300 ease-in-out ${expanded ? 'w-64' : 'w-16'}`}
      style={{
        overflow: 'hidden'
      }}
    >
      {/* Toggle sidebar expansion - now at the top of sidebar */}
      <div className="flex justify-end p-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
          onClick={toggleSidebar}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? 
            <ArrowLeftToLine className="h-4 w-4" /> : 
            <ArrowRightToLine className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-3 mt-1 flex items-center justify-center">
        <div className={`flex items-center ${expanded ? 'w-full space-x-3' : 'justify-center'}`}>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          {expanded && (
            <div className="space-y-1 overflow-hidden flex-1 min-w-0">
              <h2 className="text-sm font-medium">{user.name || 'New User'}</h2>
              <p className="text-xs text-muted-foreground truncate">{user.position || user.center || 'No position set'}</p>
            </div>
          )}
        </div>
      </div>

      <Separator className="mb-3 mx-2" />
      
      {/* Upcoming Shifts */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{expanded ? "Upcoming Shifts" : ""}</h3>
          {expanded && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setUpcomingShiftsExpanded(!upcomingShiftsExpanded)}
            >
              {upcomingShiftsExpanded ? 
                <ChevronDown className="h-3.5 w-3.5" /> : 
                <ChevronRight className="h-3.5 w-3.5" />}
            </Button>
          )}
        </div>
        
        {(expanded && upcomingShiftsExpanded) ? (
          <div className="space-y-2">
            {upcomingShifts.length > 0 ? (
              upcomingShifts.map((shift, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-md ${getShiftTypeColor(shift.type)}`}>
                      {getShiftTypeIcon(shift.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium truncate">{getShiftTypeLabel(shift.type)}</h4>
                        <span className="text-xs text-muted-foreground">{formatShiftDate(shift.date)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {shift.startTime} - {shift.endTime} • {shift.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground py-2 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                <p>No upcoming shifts</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-xs p-0 h-auto mt-1"
                  onClick={() => router.push('/schedule')}
                >
                  View all shifts
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-2 text-xs" 
              size="sm"
              onClick={() => router.push('/calendar')}
            >
              View all shifts
            </Button>
          </div>
        ) : expanded ? (
          <div 
            className="text-center py-2 text-sm text-muted-foreground cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setUpcomingShiftsExpanded(true)}
          >
            Click to expand
          </div>
        ) : null}
      </div>
      
      {/* Quick Access - Removed */}

      <Separator className="mb-3 mx-2" />

      {/* Navigation */}
      <div className="flex-1 px-3">
        {expanded && <h3 className="text-sm font-medium mb-3 px-1">Navigation</h3>}
        <nav className="space-y-1.5">
          <NavItem 
            icon={Home} 
            label="Dashboard"
            href="/" 
            isActive={isActivePath('/')} 
            expanded={expanded}
            onClick={() => router.push('/')}
          />
          <NavItem 
            icon={CalendarIcon} 
            label="Schedule"
            href="/calendar" 
            isActive={isActivePath('/calendar')} 
            expanded={expanded}
            onClick={() => router.push('/calendar')}
          />
          <NavItem 
            icon={BarChart3} 
            label="Statistics"
            href="/stats" 
            isActive={isActivePath('/stats')} 
            expanded={expanded}
            onClick={() => router.push('/stats')}
          />
          <NavItem 
            icon={User} 
            label="Profile"
            href="/profile" 
            isActive={isActivePath('/profile')} 
            expanded={expanded}
            onClick={() => router.push('/profile')}
          />
        </nav>
      </div>

      {/* Footer */}
      <div className="pb-4 px-3">
        <Separator className="my-3 mx-2" />
        <NavItem 
          icon={Settings} 
          label="Settings"
          href="/settings" 
          isActive={isActivePath('/settings')} 
          expanded={expanded}
          onClick={() => router.push('/settings')}
        />
        
        <div className="mt-3">
          <ThemeToggle expanded={expanded} theme={theme} setTheme={setTheme} />
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 mx-2">
          <NavItem 
            icon={LogOut} 
            label="Logout"
            href="/logout" 
            isActive={false} 
            expanded={expanded}
            onClick={() => router.push('/login')}
            variant="destructive"
          />
        </div>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon: React.ElementType
  label: string
  href: string
  isActive: boolean
  expanded: boolean
  onClick: () => void
  variant?: 'default' | 'destructive'
}

function NavItem({ icon: Icon, label, isActive, expanded, onClick, variant = 'default' }: NavItemProps) {
  return (
    <TooltipProvider delayDuration={expanded ? 1000 : 100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              'rounded-lg transition-all duration-200 ease-in-out h-10',
              expanded ? 'w-full justify-start px-3' : 'w-10 p-0 mx-auto justify-center',
              isActive && 'bg-primary/10 text-primary font-medium',
              !isActive && 'hover:bg-muted/80',
              variant === 'destructive' && 'text-destructive hover:text-destructive hover:bg-destructive/10'
            )}
            onClick={onClick}
          >
            <Icon className={cn("h-5 w-5", expanded && "mr-3")} />
            {expanded && <span className="truncate">{label}</span>}
          </Button>
        </TooltipTrigger>
        {!expanded && <TooltipContent side="right" className="font-medium">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}

interface ThemeToggleProps {
  expanded: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

function ThemeToggle({ expanded, theme, setTheme }: ThemeToggleProps) {
  return (
    <TooltipProvider delayDuration={expanded ? 1000 : 100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              'rounded-lg transition-all duration-200 ease-in-out h-10',
              expanded ? 'w-full justify-start px-3' : 'w-10 p-0 mx-auto justify-center',
              'hover:bg-muted/80'
            )}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Moon className={cn("h-5 w-5", expanded && "mr-3")} />
            ) : (
              <Sun className={cn("h-5 w-5", expanded && "mr-3")} />
            )}
            {expanded && <span>Theme</span>}
          </Button>
        </TooltipTrigger>
        {!expanded && <TooltipContent side="right" className="font-medium">Theme</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
