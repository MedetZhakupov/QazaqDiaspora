'use client'

import { useState } from 'react'

type MenuItemWithClaims = {
  id: string
  name: string
  quantity: number
  claimed: number
}

type MenuSelectionProps = {
  menuItems: MenuItemWithClaims[]
  onRegister: (selectedItems: { menuItemId: string; quantity: number }[]) => Promise<void>
  isLoading?: boolean
}

export default function MenuSelection({ menuItems, onRegister, isLoading = false }: MenuSelectionProps) {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      const newSelected = { ...selectedItems }
      delete newSelected[itemId]
      setSelectedItems(newSelected)
    } else {
      setSelectedItems({ ...selectedItems, [itemId]: quantity })
    }
  }

  const handleSubmit = async () => {
    const selections = Object.entries(selectedItems).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }))

    if (selections.length === 0) {
      setError('Кем дегенде бір тағам таңдаңыз')
      return
    }

    setError(null)
    await onRegister(selections)
  }

  const totalSelected = Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0)

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Өзіңізбен әкелетін тағамды таңдаңыз
        </h3>
        <p className="text-gray-700">
          Іс-шараға тіркелу үшін кем дегенде бір тағамды таңдау керек
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {menuItems.map((item) => {
          const available = item.quantity - item.claimed
          const selected = selectedItems[item.id] || 0
          const maxCanSelect = Math.min(available, item.quantity)

          return (
            <div
              key={item.id}
              className={`border-2 rounded-xl p-5 transition ${
                selected > 0
                  ? 'border-green-400 bg-green-50'
                  : available > 0
                  ? 'border-gray-200 bg-white hover:border-blue-300'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Қалған: {available} / {item.quantity}
                  </p>
                </div>

                {available > 0 ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, Math.max(0, selected - 1))}
                      disabled={selected === 0}
                      className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{selected}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, Math.min(maxCanSelect, selected + 1))}
                      disabled={selected >= maxCanSelect}
                      className="w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-red-600 font-medium">Бітті</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>Бұл іс-шараға тағам мәзірі жоқ</p>
        </div>
      )}

      {totalSelected > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5">
          <p className="text-green-800 font-semibold">
            Сіз {totalSelected} тағам таңдадыңыз
          </p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || menuItems.every(item => item.quantity - item.claimed === 0)}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Тіркелуде...' : 'Іс-шараға тіркелу'}
      </button>
    </div>
  )
}
