import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/[locale]/auth/actions'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import LanguageSwitcher from './LanguageSwitcher'
import MobileMenu from './MobileMenu'

export default async function Navbar() {
  const t = await getTranslations('navbar')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    isAdmin = profile?.is_admin || false
  }

  return (
    <nav className="relative bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      {/* Animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3 hover:opacity-80 transition group">
              <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">🇰🇿</span>
              <span className="text-gray-900 hidden sm:inline">
                {locale === 'kk' ? 'Қазақтар қоғамдастығы' : 'Kazakh Community'}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href={`/${locale}/events/create`}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold hover:scale-105"
                    >
                      {t('createEvent')}
                    </Link>
                  )}
                  <span className="text-gray-600 px-3">{user.email}</span>
                  <form action={signout}>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium border border-gray-300 hover:border-gray-400"
                    >
                      {t('logout')}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* <Link
                    href={`/${locale}/auth/login`}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition font-medium border border-gray-300 hover:border-gray-400"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href={`/${locale}/auth/signup`}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold hover:scale-105"
                  >
                    {t('signup')}
                  </Link> */}
                </>
              )}
            </div>

            {/* Mobile Menu - Shown on mobile only */}
            <MobileMenu user={user} isAdmin={isAdmin} locale={locale} signoutAction={signout} />
          </div>
        </div>
      </div>
    </nav>
  )
}
