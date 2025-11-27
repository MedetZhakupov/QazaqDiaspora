import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { updateEvent } from '../../actions'
import EventForm from '@/components/EventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: event, error } = await supabase
    .from('events')
    .select()
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (error || !event) {
    notFound()
  }

  const updateEventWithId = async (formData: FormData) => {
    'use server'
    return await updateEvent(id, formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Іс-шараны өңдеу
          </h1>
          <p className="text-gray-600">Іс-шара мәліметтерін жаңарту</p>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
          <EventForm action={updateEventWithId} event={event} submitLabel="Жаңарту" />
        </div>
      </div>
    </div>
  )
}
