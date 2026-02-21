import { useEffect, useState } from 'react'
import {
  completeRequest,
  fetchMyRequests,
  fetchRequestHistory,
  takeRequest as takeRequestApi,
} from './api'
import type { Request, RequestHistoryEntry } from './types'
import { useUser } from './UserContext'
import { StatusBadge } from './StatusBadge'
import { RequestHistory } from './RequestHistory'

export function MasterPanel() {
  const { currentUser } = useUser()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyFor, setHistoryFor] = useState<number | null>(null)
  const [historyEntries, setHistoryEntries] = useState<RequestHistoryEntry[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'master') {
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchMyRequests(currentUser.id)
        if (!cancelled) {
          setRequests(data)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError('Не удалось загрузить заявки мастера')
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
  }, [currentUser])

  if (!currentUser || currentUser.role !== 'master') {
    return null
  }

  async function refresh() {
    try {
      const data = await fetchMyRequests(currentUser.id)
      setRequests(data)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось обновить список заявок')
      }
    }
  }

  async function handleTake(requestId: number) {
    setError(null)
    try {
      await takeRequestApi(requestId, currentUser.id)
      await refresh()
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось взять заявку в работу')
      }
    }
  }

  async function handleComplete(requestId: number) {
    setError(null)
    try {
      await completeRequest(requestId, currentUser.id)
      await refresh()
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось завершить заявку')
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
        <h2>Панель мастера</h2>
      </header>

      {loading && <p className="status">Загрузка заявок...</p>}
      {error && <p className="status error">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="status">Для вас нет заявок</p>
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
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.clientName}</td>
                <td>{request.phone}</td>
                <td>{request.address}</td>
                <td>{request.problemText}</td>
                <td>
                  <StatusBadge status={request.status} />
                </td>
                <td>
                  {request.status === 'assigned' && (
                    <button
                      type="button"
                      onClick={() => handleTake(request.id)}
                    >
                      Взять в работу
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => handleComplete(request.id)}
                    >
                      Завершить
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
            ))}
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
