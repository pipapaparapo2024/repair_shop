export type UserRole = 'dispatcher' | 'master'

export type User = {
  id: number
  name: string
  role: UserRole
}

export type RequestStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'done'
  | 'canceled'

export type Request = {
  id: number
  clientName: string
  phone: string
  address: string
  problemText: string
  status: RequestStatus
  assignedTo: number | null
  createdAt: string
  updatedAt: string
}

export type RequestHistoryEntry = {
  id: number
  requestId: number
  prevStatus: RequestStatus | null
  nextStatus: RequestStatus
  changedBy: number | null
  changedByName: string | null
  changedAt: string
}

export type CreateRequestPayload = {
  clientName: string
  phone: string
  address: string
  problemText: string
}
