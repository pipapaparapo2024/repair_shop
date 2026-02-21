import type {
  CreateRequestPayload,
  Request,
  RequestHistoryEntry,
  RequestStatus,
  User,
} from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    const data = (await response
      .json()
      .catch(() => null)) as { error?: string } | null
    if (data && data.error) {
      message = data.error
    }
    throw new Error(message)
  }
  return (await response.json()) as T
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`)
  return handleResponse<User[]>(response)
}

export async function createRequest(payload: CreateRequestPayload) {
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function fetchRequests(
  userId: number,
  status?: RequestStatus,
): Promise<Request[]> {
  const url =
    status === undefined
      ? `${API_URL}/requests`
      : `${API_URL}/requests?status=${encodeURIComponent(status)}`
  const response = await fetch(url, {
    headers: {
      'x-user-id': String(userId),
    },
  })
  return handleResponse<Request[]>(response)
}

export async function fetchMyRequests(userId: number): Promise<Request[]> {
  const response = await fetch(`${API_URL}/requests/my`, {
    headers: {
      'x-user-id': String(userId),
    },
  })
  return handleResponse<Request[]>(response)
}

export async function assignRequest(
  requestId: number,
  assignedTo: number,
  dispatcherId: number,
) {
  const response = await fetch(`${API_URL}/requests/${requestId}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': String(dispatcherId),
    },
    body: JSON.stringify({ assignedTo }),
  })
  return handleResponse(response)
}

export async function cancelRequest(requestId: number, dispatcherId: number) {
  const response = await fetch(`${API_URL}/requests/${requestId}/cancel`, {
    method: 'PATCH',
    headers: {
      'x-user-id': String(dispatcherId),
    },
  })
  return handleResponse(response)
}

export async function takeRequest(requestId: number, masterId: number) {
  const response = await fetch(`${API_URL}/requests/${requestId}/take`, {
    method: 'PATCH',
    headers: {
      'x-user-id': String(masterId),
    },
  })
  return handleResponse(response)
}

export async function completeRequest(requestId: number, masterId: number) {
  const response = await fetch(`${API_URL}/requests/${requestId}/done`, {
    method: 'PATCH',
    headers: {
      'x-user-id': String(masterId),
    },
  })
  return handleResponse(response)
}

export async function fetchRequestHistory(
  requestId: number,
  userId: number,
): Promise<RequestHistoryEntry[]> {
  const response = await fetch(`${API_URL}/requests/${requestId}/history`, {
    headers: {
      'x-user-id': String(userId),
    },
  })
  return handleResponse<RequestHistoryEntry[]>(response)
}
