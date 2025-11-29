'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

type MobileMenuProps = {
  user: any
  isAdmin: boolean
  locale: string
  signoutAction: () => Promise<void>
}

export default function MobileMenu({ user, isAdmin, locale, signoutAction }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('navbar')

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-lg font-bold text-gray-900">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="mb-4">
              <LanguageSwitcher />
            </div>

            {user ? (
              <>
                <div className="text-sm text-gray-600 px-3 py-2 border-b border-gray-200">
                  {user.email}
                </div>

                {isAdmin && (
                  <Link
                    href={`/${locale}/events/create`}
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-center"
                  >
                    {t('createEvent')}
                  </Link>
                )}

                <form action={signoutAction} className="w-full">
                  <button
                    type="submit"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium border border-gray-300"
                  >
                    {t('logout')}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Login/Signup buttons can be uncommented if needed */}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
