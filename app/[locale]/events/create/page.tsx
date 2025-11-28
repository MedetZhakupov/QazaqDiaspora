import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createEvent } from '../actions'
import EventForm from '@/components/EventForm'
import { getTranslations } from 'next-intl/server'

export default async function CreateEventPage() {
  const t = await getTranslations('eventForm')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            {t('createEvent')}
          </h1>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
          <EventForm action={createEvent} submitLabel={t('create')} />
        </div>
      </div>
    </div>
  )
}
