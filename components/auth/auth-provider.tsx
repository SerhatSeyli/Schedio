"use client"

import { ReactNode, useEffect } from 'react'

import { useUserStore } from '@/store/user-store'
import { useShiftStore } from '@/store/shift-store'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>
}
