import { useState, type ReactNode } from 'react'
import type { User } from './types'
import { UserContext, type UserContextValue } from './UserContext'

type UserProviderProps = {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const value: UserContextValue = { currentUser, setCurrentUser }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

