'use client'

import { useState } from 'react'

export type MenuItem = {
  name: string
  quantity: number
  tempId?: string // for client-side tracking before save
}

type MenuItemsManagerProps = {
  menuItems: MenuItem[]
  onChange: (items: MenuItem[]) => void
}

export default function MenuItemsManager({ menuItems, onChange }: MenuItemsManagerProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)

  const addMenuItem = () => {
    if (newItemName.trim()) {
      const newItem: MenuItem = {
        name: newItemName.trim(),
        quantity: newItemQuantity,
        tempId: Date.now().toString(),
      }
      onChange([...menuItems, newItem])
      setNewItemName('')
      setNewItemQuantity(1)
    }
  }

  const removeMenuItem = (index: number) => {
    onChange(menuItems.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, quantity: number) => {
    const updated = [...menuItems]
    updated[index] = { ...updated[index], quantity: Math.max(1, quantity) }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 bg-blue-50/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Тағам тізімін қосу
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMenuItem())}
              placeholder="Тағам атауы (мысалы: Беспармақ, Самса)"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
              placeholder="Саны"
              className="block w-24 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={addMenuItem}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Қосу
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-3">
          Қатысушылар әрбір тағамды әкелетінін таңдауы керек
        </p>
      </div>

      {menuItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Қосылған тағамдар ({menuItems.length}):</h4>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={item.tempId || index}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <div className="flex items-center flex-1">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Саны:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMenuItem(index)}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition font-medium text-sm"
                  >
                    Жою
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {menuItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <p>Тағам тізімі бос. Жоғарыдан тағам қосыңыз.</p>
        </div>
      )}
    </div>
  )
}
