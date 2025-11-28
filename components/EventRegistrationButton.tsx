'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type EventRegistrationButtonProps = {
  eventId: string
  registerAction: (eventId: string) => Promise<{ error?: string; success?: boolean }>
  isUnregister?: boolean
}

export default function EventRegistrationButton({
  eventId,
  registerAction,
  isUnregister = false,
}: EventRegistrationButtonProps) {
  const t = useTranslations('event')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await registerAction(eventId)
    if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-medium">
          {error}
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full px-8 py-4 rounded-xl font-semibold transition shadow-lg ${
          isUnregister
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? t('processing') : isUnregister ? t('unregister') : t('register')}
      </button>
    </div>
  )
}
