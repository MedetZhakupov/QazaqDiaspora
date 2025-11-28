'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { resend } from '@/lib/resend'
import { getAttendeeConfirmationEmail, getOrganizerNotificationEmail } from '@/lib/email-templates'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create an event' }
  }

  // Convert datetime-local to ISO string with local timezone
  const startDate = formData.get('start_date') as string
  const endDate = formData.get('end_date') as string

  const eventData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    location: formData.get('location') as string,
    image_url: formData.get('image_url') as string || null,
    start_date: startDate,
    end_date: endDate,
    max_attendees: parseInt(formData.get('max_attendees') as string) || null,
    max_guests_per_registration: parseInt(formData.get('max_guests_per_registration') as string) || 4,
    organizer_id: user.id,
  }

  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Handle menu items
  const menuItemsJson = formData.get('menuItems') as string
  if (menuItemsJson) {
    try {
      const menuItems = JSON.parse(menuItemsJson)
      if (menuItems.length > 0) {
        const menuItemsData = menuItems.map((item: { name: string; quantity: number }) => ({
          event_id: data.id,
          name: item.name,
          quantity: item.quantity,
        }))

        const { error: menuError } = await supabase
          .from('menu_items')
          .insert(menuItemsData)

        if (menuError) {
          console.error('Error creating menu items:', menuError)
        }
      }
    } catch (e) {
      console.error('Error parsing menu items:', e)
    }
  }

  revalidatePath('/')
  redirect(`/events/${data.id}`)
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update an event' }
  }

  const eventData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    location: formData.get('location') as string,
    image_url: formData.get('image_url') as string || null,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    max_attendees: parseInt(formData.get('max_attendees') as string) || null,
    max_guests_per_registration: parseInt(formData.get('max_guests_per_registration') as string) || 4,
  }

  const { error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .eq('organizer_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/events/${eventId}`)
  redirect(`/events/${eventId}`)
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to delete an event' }
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('organizer_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  redirect('/')
}

export async function registerForEvent(
  eventId: string,
  guestCount: number,
  menuSelections?: { menuItemId: string; quantity: number }[]
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Тіркелу үшін жүйеге кіру керек' }
  }

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('max_attendees')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { error: 'Іс-шара табылмады' }
  }

  // Check max_attendees limit
  if (event.max_attendees) {
    // Get all current registrations with guest counts
    const { data: allRegistrations } = await supabase
      .from('event_registrations')
      .select('id, guest_count')
      .eq('event_id', eventId)

    // Calculate total current attendees (each registration = 1 person + their guests)
    const currentAttendees = allRegistrations?.reduce((total: number, reg: any) => {
      return total + 1 + (reg.guest_count || 0)
    }, 0) || 0

    // Calculate total people for this registration
    const newAttendees = 1 + guestCount

    // Check if adding this registration would exceed max_attendees
    if (currentAttendees + newAttendees > event.max_attendees) {
      const spotsLeft = event.max_attendees - currentAttendees
      return {
        error: spotsLeft > 0
          ? `Кешіріңіз, тек ${spotsLeft} орын қалды. Сіз ${newAttendees} адам үшін тіркелуге тырысып жатырсыз.`
          : 'Кешіріңіз, іс-шараға барлық орындар толды'
      }
    }
  }

  // Check if event has menu items
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, quantity')
    .eq('event_id', eventId)

  // Check if menu items are available
  let menuItemsExhausted = false
  if (menuItems && menuItems.length > 0) {
    // Get total claimed quantities
    const { data: menuClaims } = await supabase
      .from('menu_claims')
      .select('menu_item_id, quantity')
      .in('menu_item_id', menuItems.map(m => m.id))

    // Calculate remaining quantities
    const claimedMap = new Map<string, number>()
    menuClaims?.forEach((claim: any) => {
      const current = claimedMap.get(claim.menu_item_id) || 0
      claimedMap.set(claim.menu_item_id, current + claim.quantity)
    })

    // Check if all menu items are exhausted
    menuItemsExhausted = menuItems.every(item => {
      const claimed = claimedMap.get(item.id) || 0
      return claimed >= item.quantity
    })

    // Only require menu selection if items are available
    if (!menuItemsExhausted && (!menuSelections || menuSelections.length === 0)) {
      return { error: 'Кем дегенде бір тағам таңдаңыз' }
    }
  }

  // Create registration
  const { data: registration, error: regError } = await supabase
    .from('event_registrations')
    .insert([{
      event_id: eventId,
      user_id: user.id,
      guest_count: guestCount,
    }])
    .select()
    .single()

  if (regError) {
    return { error: regError.message }
  }

  // Create menu claims if selections exist (only if menu items are not exhausted)
  if (menuSelections && menuSelections.length > 0 && registration && !menuItemsExhausted) {
    const menuClaims = menuSelections.map(selection => ({
      menu_item_id: selection.menuItemId,
      user_id: user.id,
      registration_id: registration.id,
      quantity: selection.quantity,
    }))

    const { error: claimsError } = await supabase
      .from('menu_claims')
      .insert(menuClaims)

    if (claimsError) {
      // Rollback registration if menu claims fail
      await supabase
        .from('event_registrations')
        .delete()
        .eq('id', registration.id)

      return { error: 'Тағам таңдауда қате орын алды' }
    }
  }

  // Send confirmation emails (non-blocking)
  sendRegistrationEmails(supabase, eventId, user.id, user.email || '', guestCount, menuSelections || [])
    .catch(error => {
      console.error('Error sending registration emails:', error)
    })

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}

async function sendRegistrationEmails(
  supabase: any,
  eventId: string,
  userId: string,
  userEmail: string,
  guestCount: number,
  menuSelections: { menuItemId: string; quantity: number }[]
) {
  // Skip if Resend is not configured
  if (!resend) {
    console.log('Skipping email sending: RESEND_API_KEY not configured')
    return
  }

  try {
    // Fetch event details
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (!event) return

    // Fetch attendee profile
    const { data: attendeeProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    // Fetch organizer profile
    const { data: organizerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', event.organizer_id)
      .single()

    // Fetch organizer email using service client
    let organizerEmail: string | undefined
    const serviceClient = createServiceClient()
    if (serviceClient) {
      const { data: { user: organizer } } = await serviceClient.auth.admin.getUserById(event.organizer_id)
      organizerEmail = organizer?.email
    }

    // Fetch menu items details if selections exist
    const menuClaims: { name: string; quantity: number }[] = []
    if (menuSelections.length > 0) {
      const menuItemIds = menuSelections.map(s => s.menuItemId)
      const { data: menuItemsData } = await supabase
        .from('menu_items')
        .select('id, name')
        .in('id', menuItemIds)

      if (menuItemsData) {
        menuItemsData.forEach((item: any) => {
          const selection = menuSelections.find(s => s.menuItemId === item.id)
          if (selection) {
            menuClaims.push({
              name: item.name,
              quantity: selection.quantity
            })
          }
        })
      }
    }

    // Get all registrations with guest counts to calculate total attendees
    const { data: allRegistrations } = await supabase
      .from('event_registrations')
      .select('id, guest_count')
      .eq('event_id', eventId)

    // Calculate total attendees (each registration = 1 person + their guests)
    const totalAttendees = allRegistrations?.reduce((total: number, reg: any) => {
      return total + 1 + (reg.guest_count || 0)
    }, 0) || 0

    const attendeeName = attendeeProfile?.full_name || 'Қатысушы'
    const organizerName = organizerProfile?.full_name || 'Ұйымдастырушы'

    // Send email to attendee
    const attendeeEmail = getAttendeeConfirmationEmail(attendeeName, event, menuClaims)
    await resend.emails.send({
      from: 'Қазақ Диаспорасы <noreply@qazaqdiaspora.nl>',
      to: userEmail,
      subject: attendeeEmail.subject,
      html: attendeeEmail.html,
    })

    // Send email to organizer
    if (organizerEmail) {
      const organizerNotification = getOrganizerNotificationEmail(
        organizerName,
        attendeeName,
        userEmail,
        event,
        menuClaims,
        guestCount,
        totalAttendees
      )
      await resend.emails.send({
        from: 'Қазақ Диаспорасы <noreply@qazaqdiaspora.nl>',
        to: organizerEmail,
        subject: organizerNotification.subject,
        html: organizerNotification.html,
      })
    }
  } catch (error) {
    console.error('Failed to send registration emails:', error)
    throw error
  }
}

export async function unregisterFromEvent(eventId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to unregister from an event' }
  }

  const { error } = await supabase
    .from('event_registrations')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/events/${eventId}`)
  return { success: true }
}
