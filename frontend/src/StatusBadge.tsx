import type { RequestStatus } from './types'

type StatusBadgeProps = {
  status: RequestStatus
}

const statusLabels: Record<RequestStatus, string> = {
  new: 'Новая',
  assigned: 'Назначена',
  in_progress: 'В работе',
  done: 'Завершена',
  canceled: 'Отменена',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge badge-${status}`}>{statusLabels[status]}</span>
}

