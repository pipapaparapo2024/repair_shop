import { useEffect, useMemo, useState } from 'react'
import {
  assignRequest,
  cancelRequest,
  fetchRequestHistory,
  fetchRequests,
} from './api'
import type { Request, RequestHistoryEntry, RequestStatus, User } from './types'
import { useUser } from './UserContext'
import { StatusBadge } from './StatusBadge'
import { RequestHistory } from './RequestHistory'

const allStatuses: { value: RequestStatus | ''; label: string }[] = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'assigned', label: 'Назначенные' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'done', label: 'Завершённые' },
  { value: 'canceled', label: 'Отменённые' },
]

type DispatcherPanelProps = {
  users: User[]
}

export function DispatcherPanel({ users }: DispatcherPanelProps) {
  const { currentUser } = useUser()
  const [requests, setRequests] = useState<Request[]>([])
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<Record<number, number | ''>>({})
  const [historyFor, setHistoryFor] = useState<number | null>(null)
  const [historyEntries, setHistoryEntries] = useState<RequestHistoryEntry[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  const masters = useMemo(
    () => users.filter((u) => u.role === 'master'),
    [users],
  )

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'dispatcher') {
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchRequests(
          currentUser.id,
          statusFilter || undefined,
        )
        if (!cancelled) {
          setRequests(data)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError('Не удалось загрузить заявки')
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [currentUser, statusFilter])

  if (!currentUser || currentUser.role !== 'dispatcher') {
    return null
  }

  function handleChangeFilter(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as RequestStatus | ''
    setStatusFilter(value)
  }

  function handleChangeAssigned(
    requestId: number,
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value = event.target.value
    setAssignment((prev) => ({
      ...prev,
      [requestId]: value === '' ? '' : Number(value),
    }))
  }

  async function handleAssign(requestId: number) {
    const masterId = assignment[requestId]
    if (!masterId || !currentUser) {
      return
    }
    setError(null)
    try {
      await assignRequest(requestId, masterId, currentUser.id)
      const data = await fetchRequests(
        currentUser.id,
        statusFilter || undefined,
      )
      setRequests(data)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось назначить мастера')
      }
    }
  }

  async function handleCancel(requestId: number) {
    if (!currentUser) {
      return
    }
    setError(null)
    try {
      await cancelRequest(requestId, currentUser.id)
      const data = await fetchRequests(
        currentUser.id,
        statusFilter || undefined,
      )
      setRequests(data)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось отменить заявку')
      }
    }
  }

  async function handleShowHistory(requestId: number) {
    if (!currentUser) {
      return
    }
    setHistoryFor(requestId)
    setHistoryError(null)
    setHistoryLoading(true)
    try {
      const entries = await fetchRequestHistory(requestId, currentUser.id)
      setHistoryEntries(entries)
    } catch (e) {
      if (e instanceof Error) {
        setHistoryError(e.message)
      } else {
        setHistoryError('Не удалось загрузить историю заявки')
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Панель диспетчера</h2>
        <div className="panel-filters">
          <label>
            Статус:
            <select value={statusFilter} onChange={handleChangeFilter}>
              {allStatuses.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {loading && <p className="status">Загрузка заявок...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="status">Заявок не найдено</p>
      )}

      {!loading && requests.length > 0 && (
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Адрес</th>
              <th>Описание</th>
              <th>Статус</th>
              <th>Мастер</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const assignedMaster =
                masters.find((m) => m.id === request.assignedTo) || null
              const currentAssignment = assignment[request.id] ?? ''
              return (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.clientName}</td>
                  <td>{request.phone}</td>
                  <td>{request.address}</td>
                  <td>{request.problemText}</td>
                  <td>
                    <StatusBadge status={request.status} />
                  </td>
                  <td>{assignedMaster ? assignedMaster.name : '—'}</td>
                  <td>
                    {request.status === 'new' && (
                      <div className="actions">
                        <select
                          value={currentAssignment}
                          onChange={(event) =>
                            handleChangeAssigned(request.id, event)
                          }
                        >
                          <option value="">Выберите мастера</option>
                          {masters.map((master) => (
                            <option key={master.id} value={master.id}>
                              {master.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAssign(request.id)}
                          disabled={!assignment[request.id]}
                        >
                          Назначить
                        </button>
                      </div>
                    )}
                    {request.status !== 'done' &&
                      request.status !== 'canceled' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(request.id)}
                        >
                          Отменить
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={() => handleShowHistory(request.id)}
                    >
                      История
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {historyFor !== null && (
        <div className="history-section">
          <h3>История заявки #{historyFor}</h3>
          {historyLoading && <p className="status">Загрузка истории...</p>}
          {historyError && <p className="status error">{historyError}</p>}
          {!historyLoading && !historyError && (
            <RequestHistory entries={historyEntries} />
          )}
        </div>
      )}
    </section>
  )
}
