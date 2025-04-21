"use client"

import { createContext, useState, useContext, useEffect } from "react"

interface SidebarContextType {
  expanded: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("sidebar-expanded")
      return savedState === null ? true : savedState === "true"
    }
    return true
  })

  const toggleSidebar = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-expanded", String(newExpanded))
    }
  }

  useEffect(() => {
    // Add the expanded state as a data attribute to the document body
    // This will help with CSS selectors for content shifting
    document.body.setAttribute("data-sidebar-expanded", String(expanded))
    
    return () => {
      document.body.removeAttribute("data-sidebar-expanded")
    }
  }, [expanded])

  return (
    <SidebarContext.Provider value={{ expanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
