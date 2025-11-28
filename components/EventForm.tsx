'use client'

import { useState } from 'react'
import MenuItemsManager, { MenuItem } from './MenuItemsManager'

type Event = {
  title: string
  description: string | null
  location: string | null
  image_url: string | null
  start_date: string
  end_date: string
  max_attendees: number | null
  max_guests_per_registration: number | null
}

type EventFormProps = {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  event?: Event
  submitLabel: string
}

export default function EventForm({ action, event, submitLabel }: EventFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  async function handleSubmit(formData: FormData) {
    // Add menu items to FormData
    formData.append('menuItems', JSON.stringify(menuItems))

    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    // Get the date in local timezone, not UTC
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-5 py-4 rounded-lg font-medium">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
          Іс-шара атауы
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          defaultValue={event?.title}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          placeholder="Іс-шараның атын енгізіңіз"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
          Сипаттама
        </label>
        <textarea
          name="description"
          id="description"
          rows={5}
          defaultValue={event?.description || ''}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-900 bg-white"
          placeholder="Іс-шара туралы толық ақпарат"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
          Орны
        </label>
        <input
          type="text"
          name="location"
          id="location"
          defaultValue={event?.location || ''}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          placeholder="Мекенжай немесе онлайн сілтеме"
        />
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-semibold text-gray-700 mb-2">
          Сурет URL (міндетті емес)
        </label>
        <input
          type="url"
          name="image_url"
          id="image_url"
          defaultValue={event?.image_url || ''}
          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          placeholder="https://example.com/image.jpg"
        />
        <p className="mt-2 text-sm text-gray-500">
          Іс-шараның артқы фон суретінің сілтемесін енгізіңіз
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
            Басталу күні мен уақыты
          </label>
          <input
            type="datetime-local"
            name="start_date"
            id="start_date"
            required
            defaultValue={event?.start_date ? formatDateTimeLocal(event.start_date) : ''}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
            Аяқталу күні мен уақыты
          </label>
          <input
            type="datetime-local"
            name="end_date"
            id="end_date"
            required
            defaultValue={event?.end_date ? formatDateTimeLocal(event.end_date) : ''}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="max_attendees" className="block text-sm font-semibold text-gray-700 mb-2">
            Қатысушылар саны (міндетті емес)
          </label>
          <input
            type="number"
            name="max_attendees"
            id="max_attendees"
            min="1"
            defaultValue={event?.max_attendees || ''}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
            placeholder="Максималды қатысушылар саны"
          />
        </div>

        <div>
          <label htmlFor="max_guests_per_registration" className="block text-sm font-semibold text-gray-700 mb-2">
            Әр адам әкеле алатын қонақтар саны
          </label>
          <input
            type="number"
            name="max_guests_per_registration"
            id="max_guests_per_registration"
            min="0"
            max="10"
            defaultValue={event?.max_guests_per_registration || 4}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
            placeholder="4"
          />
          <p className="mt-2 text-sm text-gray-500">
            Тіркелуші өзімен қоса әкеле алатын адамдар саны (балалар, отбасы мүшелері)
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Тағам мәзірі</h3>
          <p className="text-gray-600">
            Қатысушылар тіркелу үшін өздерімен әкелетін тағамды таңдауы керек
          </p>
        </div>
        <MenuItemsManager menuItems={menuItems} onChange={setMenuItems} />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
