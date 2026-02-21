import { useState } from 'react'
import { createRequest } from './api'
import type { CreateRequestPayload } from './types'

const initialForm: CreateRequestPayload = {
  clientName: '',
  phone: '',
  address: '',
  problemText: '',
}

export function CreateRequestForm() {
  const [form, setForm] = useState<CreateRequestPayload>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      await createRequest(form)
      setSuccess('Заявка успешно отправлена')
      setForm(initialForm)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Не удалось отправить заявку')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Создать новую заявку</h2>
      <label>
        Имя клиента
        <input
          name="clientName"
          value={form.clientName}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Телефон
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Адрес
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Описание проблемы
        <textarea
          name="problemText"
          value={form.problemText}
          onChange={handleChange}
          rows={4}
          required
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Отправка...' : 'Отправить заявку'}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </form>
  )
}

