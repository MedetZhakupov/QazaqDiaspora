'use client'

import { useState } from 'react'
import MenuSelection from './MenuSelection'

type MenuItemWithClaims = {
  id: string
  name: string
  quantity: number
  claimed: number
}

type EventRegistrationProps = {
  eventId: string
  menuItems: MenuItemWithClaims[]
  registerAction: (eventId: string, menuSelections?: { menuItemId: string; quantity: number }[]) => Promise<{ error?: string; success?: boolean }>
}

export default function EventRegistration({ eventId, menuItems, registerAction }: EventRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (selectedItems: { menuItemId: string; quantity: number }[]) => {
    setIsLoading(true)
    setError(null)

    const result = await registerAction(eventId, selectedItems)

    if (result?.error) {
      setError(result.error)
    }

    setIsLoading(false)
  }

  if (menuItems.length === 0) {
    // No menu items, simple registration
    return (
      <div>
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-medium">
            {error}
          </div>
        )}
        <button
          onClick={() => handleRegister([])}
          disabled={isLoading}
          className="w-full px-8 py-4 rounded-xl font-semibold transition shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Өңделуде...' : 'Іс-шараға тіркелу'}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <MenuSelection
        menuItems={menuItems}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
      {error && (
        <div className="mt-4 bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-medium">
          {error}
        </div>
      )}
    </div>
  )
}
