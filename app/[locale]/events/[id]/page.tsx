import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { registerForEvent, unregisterFromEvent, deleteEvent } from '../actions'
import EventRegistration from '@/components/EventRegistration'
import EventRegistrationButton from '@/components/EventRegistrationButton'
import DeleteEventButton from '@/components/DeleteEventButton'
import { DownloadRegistrationsButton } from '@/components/DownloadRegistrationsButton'
import { getLocale, getTranslations } from 'next-intl/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EventPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale: paramsLocale } = await params
  const locale = await getLocale()
  const t = await getTranslations('event')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: event, error } = await supabase
    .from('events')
    .select('id, title_kk, title_en, description_kk, description_en, location, start_date, end_date, max_attendees, image_url, organizer_id, created_at, updated_at, max_guests_per_registration')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Get localized title and description
  const title = locale === 'kk' ? event.title_kk : (event.title_en || event.title_kk)
  const description = locale === 'kk' ? event.description_kk : (event.description_en || event.description_kk)

  // Fetch organizer profile
  const { data: organizerProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', event.organizer_id)
    .single()

  const eventWithProfile = {
    ...event,
    title,
    description,
    profiles: organizerProfile
  }

  // Fetch menu items with claims count
  const { data: menuItemsRaw } = await supabase
    .from('menu_items')
    .select(`
      id,
      name_kk,
      name_en,
      quantity,
      menu_claims(quantity)
    `)
    .eq('event_id', id)

  const menuItems = (menuItemsRaw || []).map(item => ({
    id: item.id,
    name: locale === 'kk' ? item.name_kk : (item.name_en || item.name_kk),
    quantity: item.quantity,
    claimed: item.menu_claims?.reduce((sum: number, claim: any) => sum + (claim.quantity || 0), 0) || 0,
  }))

  // Fetch user's menu claims if registered
  let userMenuClaims: any[] = []
  if (user) {
    const { data: claims } = await supabase
      .from('menu_claims')
      .select(`
        quantity,
        menu_items(name_kk, name_en)
      `)
      .eq('user_id', user.id)
      .in('menu_item_id', menuItems.map(m => m.id))

    userMenuClaims = (claims || []).map((claim: any) => ({
      quantity: claim.quantity,
      name: locale === 'kk' ? claim.menu_items?.name_kk : (claim.menu_items?.name_en || claim.menu_items?.name_kk)
    }))
  }

  let registration = null
  let registrationCount = 0

  if (user) {
    const { data } = await supabase
      .from('event_registrations')
      .select()
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single()

    registration = data
  }

  // Fetch all registrations with guest counts to calculate total attendees
  const { data: allRegistrations, error: countError } = await supabase
    .from('event_registrations')
    .select('id, guest_count')
    .eq('event_id', id)

  // Calculate total attendees (each registration = 1 person + their guests)
  registrationCount = allRegistrations?.reduce((total, reg) => {
    return total + 1 + (reg.guest_count || 0)
  }, 0) || 0

  const isOrganizer = user?.id === eventWithProfile.organizer_id
  const isFull = eventWithProfile.max_attendees && registrationCount >= eventWithProfile.max_attendees
  const canRegister = user && !isOrganizer && !registration && !isFull

  const formatDate = (dateString: string) => {
    const dateLocale = locale === 'kk' ? 'kk-KZ' : 'en-US'
    return new Date(dateString).toLocaleString(dateLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer"></div>
          </div>
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                {eventWithProfile.title}
              </h1>
              {isOrganizer && (
                <div className="flex flex-wrap gap-3">
                  <DownloadRegistrationsButton eventId={id} locale={locale} />
                  <Link
                    href={`/${locale}/events/${id}/edit`}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium border border-gray-300 hover:border-gray-400"
                  >
                    {t('edit')}
                  </Link>
                  <DeleteEventButton eventId={id} deleteAction={deleteEvent} />
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-semibold text-blue-900">{t('dateTime')}</h3>
                </div>
                <p className="text-blue-800 ml-7">
                  {formatDate(eventWithProfile.start_date)}
                </p>
              </div>

              {eventWithProfile.location && (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="font-semibold text-indigo-900">{t('location')}</h3>
                  </div>
                  <p className="text-indigo-800 ml-7">{eventWithProfile.location}</p>
                </div>
              )}

              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="font-semibold text-amber-900">{t('attendees')}</h3>
                </div>
                <p className="text-amber-800 ml-7">
                  {registrationCount}/{eventWithProfile.max_attendees}
                  {isFull && <span className="ml-2 text-rose-600 font-bold">({t('full')})</span>}
                </p>
              </div>
            </div>

            {eventWithProfile.description && (
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('description')}</h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{eventWithProfile.description}</p>
                </div>
              </div>
            )}

            {/* Menu Display */}
            {menuItems.length > 0 && (
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t('foodMenu')}
                </h3>
                <div className="grid gap-3">
                  {menuItems.map((item) => (
                    <div key={item.id} className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex justify-between items-center hover:border-amber-300 transition-colors">
                      <span className="font-semibold text-amber-900">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-700">
                          {item.claimed} / {item.quantity} {t('claimed')}
                        </span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(100, (item.claimed / item.quantity) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canRegister && (
              <EventRegistration
                eventId={id}
                menuItems={menuItems}
                maxGuestsPerRegistration={eventWithProfile.max_guests_per_registration || 4}
                registerAction={registerForEvent}
              />
            )}

            {registration && !isOrganizer && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl font-medium">
                  {t('registered')}
                </div>

                {/* Show user's menu claims */}
                {userMenuClaims.length > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-300 p-5 rounded-2xl">
                    <h4 className="font-bold text-blue-900 mb-3">{t('yourFood')}</h4>
                    <ul className="space-y-2">
                      {userMenuClaims.map((claim: any, idx: number) => (
                        <li key={idx} className="flex items-center text-blue-800">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {claim.name} × {claim.quantity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <EventRegistrationButton
                  eventId={id}
                  registerAction={unregisterFromEvent}
                  isUnregister={true}
                />
              </div>
            )}

            {!user && (
              <div className="bg-blue-50 border-2 border-blue-300 text-blue-800 px-6 py-4 rounded-2xl">
                {t('loginToRegister')}{' '}
                <Link href={`/${locale}/auth/login`} className="font-bold underline hover:text-blue-900">
                  {t('loginHere')}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href={`/${locale}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group">
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToEvents')}
          </Link>
        </div>
      </div>
    </div>
  )
}
