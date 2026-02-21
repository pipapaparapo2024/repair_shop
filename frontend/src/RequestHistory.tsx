import type { RequestHistoryEntry } from './types'
import { StatusBadge } from './StatusBadge'

type RequestHistoryProps = {
  entries: RequestHistoryEntry[]
}

export function RequestHistory({ entries }: RequestHistoryProps) {
  if (entries.length === 0) {
    return <p className="status">История изменений отсутствует</p>
  }

  return (
    <div className="history-card">
      <h3>История изменений</h3>
      <table className="history-table">
        <thead>
          <tr>
            <th>Время</th>
            <th>Статус</th>
            <th>Из</th>
            <th>Кем изменено</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.changedAt).toLocaleString()}</td>
              <td>
                <StatusBadge status={entry.nextStatus} />
              </td>
              <td>
                {entry.prevStatus ? (
                  <StatusBadge status={entry.prevStatus} />
                ) : (
                  'Создание'
                )}
              </td>
              <td>{entry.changedByName || 'Система'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

