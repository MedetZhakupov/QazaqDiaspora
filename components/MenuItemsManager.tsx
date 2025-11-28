'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

export type MenuItem = {
  id?: string // existing menu item ID from database
  name_kk: string
  name_en: string
  quantity: number
  tempId?: string // for client-side tracking before save
}

type MenuItemsManagerProps = {
  menuItems: MenuItem[]
  onChange: (items: MenuItem[]) => void
}

export default function MenuItemsManager({ menuItems, onChange }: MenuItemsManagerProps) {
  const t = useTranslations('eventForm')
  const [newItemNameKk, setNewItemNameKk] = useState('')
  const [newItemNameEn, setNewItemNameEn] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)

  const addMenuItem = () => {
    if (newItemNameKk.trim()) {
      const newItem: MenuItem = {
        name_kk: newItemNameKk.trim(),
        name_en: newItemNameEn.trim(),
        quantity: newItemQuantity,
        tempId: Date.now().toString(),
      }
      onChange([...menuItems, newItem])
      setNewItemNameKk('')
      setNewItemNameEn('')
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

  const updateNameKk = (index: number, name_kk: string) => {
    const updated = [...menuItems]
    updated[index] = { ...updated[index], name_kk }
    onChange(updated)
  }

  const updateNameEn = (index: number, name_en: string) => {
    const updated = [...menuItems]
    updated[index] = { ...updated[index], name_en }
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 bg-blue-50/50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('addMenuItem')}
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('itemName')} (Қазақша) *
              </label>
              <input
                type="text"
                value={newItemNameKk}
                onChange={(e) => setNewItemNameKk(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMenuItem())}
                placeholder="Тағам атауы (мысалы: Беспармақ, Самса)"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('itemName')} (English)
              </label>
              <input
                type="text"
                value={newItemNameEn}
                onChange={(e) => setNewItemNameEn(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMenuItem())}
                placeholder="Food name (e.g. Beshbarmak, Samsa)"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quantity')}
              </label>
              <input
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                placeholder="Саны"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addMenuItem}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                {t('addMenuItem')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">Added menu items ({menuItems.length}):</h4>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div
                key={item.id || item.tempId || index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
              >
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">🇰🇿 Kazakh</label>
                      <input
                        type="text"
                        value={item.name_kk}
                        onChange={(e) => updateNameKk(index, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                        placeholder="Тағам атауы"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">🇬🇧 English</label>
                      <input
                        type="text"
                        value={item.name_en || ''}
                        onChange={(e) => updateNameEn(index, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                        placeholder="Food name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">{t('quantity')}:</label>
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
                      {t('remove')}
                    </button>
                  </div>
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
          <p>No menu items yet. Add menu items above.</p>
        </div>
      )}
    </div>
  )
}
