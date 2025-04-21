import type React from "react"
import { Calendar, Home, PieChart, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activePage?: "home" | "calendar" | "stats" | "profile"
}

export function BottomNav({ activePage = "home" }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 px-4 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavItem href="/" icon={<Home className="h-5 w-5" />} label="Home" active={activePage === "home"} />
        <NavItem
          href="/calendar"
          icon={<Calendar className="h-5 w-5" />}
          label="Calendar"
          active={activePage === "calendar"}
        />
        <NavItem href="/stats" icon={<PieChart className="h-5 w-5" />} label="Stats" active={activePage === "stats"} />
        <NavItem
          href="/profile"
          icon={<User className="h-5 w-5" />}
          label="Profile"
          active={activePage === "profile"}
        />
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors",
        active
          ? "text-primary bg-primary/10"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}
