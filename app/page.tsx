import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  // Fetch events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')

  // Create a map of profiles for easy lookup
  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // Enrich events with profile data
  const eventsWithProfiles = events?.map(event => ({
    ...event,
    profiles: profilesMap.get(event.organizer_id) || null
  }))

  console.log('Events query:', { events: eventsWithProfiles, error })

  if (error) {
    console.error('Error fetching events:', error)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="relative">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-2 tracking-tight">
                Дүниежүзі қазақтарының қауымдастығының
              </h1>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-light tracking-wide">
            Нидерланды Корольдігіндегі филиалы
          </p>
          <div className="mt-6 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </header>

        <main>
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl">
              <strong>Қате:</strong> {error.message}
            </div>
          )}

          {eventsWithProfiles && eventsWithProfiles.length > 0 ? (
            <div className="space-y-8">
              {eventsWithProfiles.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group relative block min-h-[85vh] rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-blue-300"
                >
                  {/* Background Image with Overlay */}
                  {event.image_url ? (
                    <div className="absolute inset-0">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Light gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                  )}

                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/20 to-sky-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Top accent bar with animation */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 group-hover:animate-shimmer"></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                    <div className="max-w-4xl">
                      <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
                        {event.title}
                      </h2>

                      <div className="flex flex-wrap gap-6 mb-6">
                        <div className="flex items-center text-blue-700 group-hover:text-blue-800 transition-colors">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-lg font-medium">{formatDate(event.start_date)}</span>
                        </div>

                        {event.location && (
                          <div className="flex items-center text-indigo-700 group-hover:text-indigo-800 transition-colors">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg font-medium">{event.location}</span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-3xl whitespace-pre-wrap">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center justify-end">
                        <div className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                          Тіркелу
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-12 bg-white rounded-3xl border border-gray-200 shadow-xl">
                <div className="text-7xl mb-6">📅</div>
                <p className="text-gray-700 mb-8 text-xl font-light">Әзірге іс-шаралар жоқ</p>
                <Link
                  href="/auth/login"
                  className="inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold tracking-wide hover:scale-105"
                >
                  Жүйеге кіру
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
