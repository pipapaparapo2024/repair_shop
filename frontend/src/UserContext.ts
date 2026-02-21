import { createContext, useContext } from 'react'
import type { User } from './types'

export type UserContextValue = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

export const UserContext = createContext<UserContextValue | undefined>(
  undefined,
)

export function useUser() {
  const value = useContext(UserContext)
  if (!value) {
    throw new Error('useUser must be used within UserProvider')
  }
  return value
}
