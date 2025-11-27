'use client'

import { useState } from 'react'

type DeleteEventButtonProps = {
  eventId: string
  deleteAction: (eventId: string) => Promise<{ error?: string } | void>
}

export default function DeleteEventButton({ eventId, deleteAction }: DeleteEventButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    const result = await deleteAction(eventId)
    if (result?.error) {
      setError(result.error)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-3">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <button
          onClick={handleDelete}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
        >
          Растау
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
        >
          Болдырмау
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md"
    >
      Жою
    </button>
  )
}
