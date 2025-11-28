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
  maxGuestsPerRegistration: number
  registerAction: (eventId: string, guestCount: number, menuSelections?: { menuItemId: string; quantity: number }[]) => Promise<{ error?: string; success?: boolean }>
}

export default function EventRegistration({ eventId, menuItems, maxGuestsPerRegistration, registerAction }: EventRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guestCount, setGuestCount] = useState(0)

  const handleRegister = async (selectedItems: { menuItemId: string; quantity: number }[]) => {
    setIsLoading(true)
    setError(null)

    // Calculate total people (1 for registrant + guest count)
    const totalPeople = 1 + guestCount

    // Calculate total menu item quantities
    const totalMenuQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0)

    // Check if all menu items are exhausted
    const allItemsExhausted = menuItems.length > 0 && menuItems.every(item => item.quantity - item.claimed === 0)

    // Validate that menu items >= total people (only if items are available)
    if (menuItems.length > 0 && !allItemsExhausted && totalMenuQuantity < totalPeople) {
      setError(`Тағам саны келетін адамдар санынан кем болмауы керек. Сіз ${totalPeople} адам үшін кем дегенде ${totalPeople} тағам таңдауыңыз керек.`)
      setIsLoading(false)
      return
    }

    const result = await registerAction(eventId, guestCount, selectedItems)

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
        {maxGuestsPerRegistration > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 p-6 rounded-2xl">
            <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-3">
              Өзіңізбен қоса әкелетін адамдар саны (балалар, отбасы мүшелері)
            </label>
            <input
              type="number"
              id="guestCount"
              min="0"
              max={maxGuestsPerRegistration}
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
            />
            <p className="mt-2 text-sm text-gray-600">
              Барлығы: {1 + guestCount} адам (сіз + {guestCount} қонақ)
            </p>
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
      {maxGuestsPerRegistration > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <label htmlFor="guestCount" className="block text-sm font-semibold text-gray-900 mb-3">
            Өзіңізбен қоса әкелетін адамдар саны (балалар, отбасы мүшелері)
          </label>
          <input
            type="number"
            id="guestCount"
            min="0"
            max={maxGuestsPerRegistration}
            value={guestCount}
            onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 bg-white"
          />
          <p className="mt-2 text-sm text-gray-600">
            Барлығы: {1 + guestCount} адам (сіз + {guestCount} қонақ). Кем дегенде {1 + guestCount} тағам таңдаңыз.
          </p>
        </div>
      )}
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
