import { useEffect, useState } from 'react'
import './App.css'
import { useUser } from './UserContext'
import { fetchUsers } from './api'
import type { User } from './types'
import { CreateRequestForm } from './CreateRequestForm'
import { DispatcherPanel } from './DispatcherPanel'
import { MasterPanel } from './MasterPanel'

function App() {
  const { currentUser, setCurrentUser } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchUsers()
        if (!cancelled) {
          setUsers(data)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          if (e instanceof Error) {
            if (e.message === 'Failed to fetch') {
              setError(
                'Не удалось подключиться к backend. Проверьте, что сервер запущен на http://localhost:3000 или через docker compose up.',
              )
            } else {
              setError(e.message)
            }
          } else {
            setError('Не удалось загрузить пользователей')
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
  }, [])

  function handleSelectUser(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(event.target.value)
    if (!id) {
      setCurrentUser(null)
      return
    }
    const user = users.find((u) => u.id === id) || null
    setCurrentUser(user)
  }

  function handleRetry() {
    setLoading(true)
    setError(null)
    fetchUsers()
      .then((data) => {
        setUsers(data)
        setError(null)
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.message === 'Failed to fetch') {
          setError(
            'Не удалось подключиться к backend. Проверьте, что сервер запущен на http://localhost:3000 или через docker compose up.',
          )
        } else if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('Не удалось загрузить пользователей')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>Заявки в ремонтную службу</h1>
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button type="button" onClick={handleRetry} disabled={loading}>
                Повторить
              </button>
            </div>
          )}
        </div>
        <div className="user-select">
          <label>
            Текущий пользователь:
            <select
              value={currentUser?.id ?? ''}
              onChange={handleSelectUser}
              disabled={loading || !!error}
            >
              <option value="">Не выбран</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main className="layout">
        <section className="left-column">
          <CreateRequestForm />
        </section>
        <section className="right-column">
          {!error && !loading && (
            <>
              <DispatcherPanel users={users} />
              <MasterPanel />
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
