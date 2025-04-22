"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { useUserStore } from "@/store/user-store"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileMenu() {
  const router = useRouter()
  const { user } = useUserStore()
  const [initials, setInitials] = useState("")
  
  // Calculate initials from user's name
  useEffect(() => {
    if (user && user.name) {
      const userInitials = user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setInitials(userInitials);
    }
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage 
            src={user.avatar || "/placeholder.svg?height=36&width=36"} 
            alt={user.name || "User"} 
          />
          <AvatarFallback>{initials || "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || "email@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/calendar")}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Schedule</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/stats")}>
            <Users className="mr-2 h-4 w-4" />
            <span>Statistics</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <UserPlus className="mr-2 h-4 w-4" />
              <span>Quick Actions</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>View Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Submit Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Add Shift</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500 hover:text-red-600" onClick={() => alert('Logout functionality would be implemented here')}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
