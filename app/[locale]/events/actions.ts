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
    title_kk: formData.get('title_kk') as string,
    title_en: formData.get('title_en') as string || null,
    description_kk: formData.get('description_kk') as string || null,
    description_en: formData.get('description_en') as string || null,
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
        const menuItemsData = menuItems.map((item: { name_kk: string; name_en: string; quantity: number }) => ({
          event_id: data.id,
          name_kk: item.name_kk,
          name_en: item.name_en || null,
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
    title_kk: formData.get('title_kk') as string,
    title_en: formData.get('title_en') as string || null,
    description_kk: formData.get('description_kk') as string || null,
    description_en: formData.get('description_en') as string || null,
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

  // Handle menu items update
  const menuItemsJson = formData.get('menuItems') as string
  if (menuItemsJson) {
    try {
      const menuItems = JSON.parse(menuItemsJson)

      // Get all existing menu item IDs for this event
      const { data: existingItems } = await supabase
        .from('menu_items')
        .select('id')
        .eq('event_id', eventId)

      const existingIds = new Set(existingItems?.map(item => item.id) || [])
      const formItemIds = new Set(menuItems.filter((item: any) => item.id).map((item: any) => item.id))

      // Update existing items and insert new ones
      for (const item of menuItems) {
        if (item.id) {
          // Update existing menu item
          await supabase
            .from('menu_items')
            .update({
              name_kk: item.name_kk,
              name_en: item.name_en || null,
              quantity: item.quantity,
            })
            .eq('id', item.id)
        } else {
          // Insert new menu item
          await supabase
            .from('menu_items')
            .insert({
              event_id: eventId,
              name_kk: item.name_kk,
              name_en: item.name_en || null,
              quantity: item.quantity,
            })
        }
      }

      // Delete menu items that were removed from the form
      const idsToDelete = Array.from(existingIds).filter(id => !formItemIds.has(id))
      if (idsToDelete.length > 0) {
        await supabase
          .from('menu_items')
          .delete()
          .in('id', idsToDelete)
      }
    } catch (e) {
      console.error('Error parsing menu items:', e)
    }
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
        .select('id, name_kk, name_en')
        .in('id', menuItemIds)

      if (menuItemsData) {
        menuItemsData.forEach((item: any) => {
          const selection = menuSelections.find(s => s.menuItemId === item.id)
          if (selection) {
            menuClaims.push({
              name: item.name_kk || item.name_en, // Prefer Kazakh, fallback to English
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

    // Map event to expected format for email templates
    const eventForEmail = {
      title: event.title_kk || event.title_en || 'Іс-шара',
      start_date: event.start_date,
      end_date: event.end_date,
      location: event.location,
      description: event.description_kk || event.description_en,
    }

    // Send email to attendee
    const attendeeEmail = getAttendeeConfirmationEmail(attendeeName, eventForEmail, menuClaims)
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
        eventForEmail,
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

export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to view registrations' }
  }

  // Check if user is the organizer
  const { data: event } = await supabase
    .from('events')
    .select('organizer_id, title_kk, title_en')
    .eq('id', eventId)
    .single()

  if (!event || event.organizer_id !== user.id) {
    return { error: 'Only the event organizer can view registrations' }
  }

  // Fetch all registrations
  const { data: registrations, error: regError } = await supabase
    .from('event_registrations')
    .select('id, user_id, guest_count, registered_at')
    .eq('event_id', eventId)
    .order('registered_at', { ascending: true })

  if (regError) {
    return { error: regError.message }
  }

  if (!registrations || registrations.length === 0) {
    return { data: [] }
  }

  // Fetch all user profiles
  const userIds = registrations.map(r => r.user_id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds)

  const profilesMap = new Map<string, string>()
  profiles?.forEach(p => {
    profilesMap.set(p.id, p.full_name || 'Unknown')
  })

  // Fetch menu claims for all registrations
  const registrationIds = registrations.map(r => r.id)
  const { data: menuClaims } = await supabase
    .from('menu_claims')
    .select(`
      registration_id,
      quantity,
      menu_items (
        name_kk,
        name_en
      )
    `)
    .in('registration_id', registrationIds)

  // Fetch user emails using service client
  const userEmails = new Map<string, string>()
  if (serviceClient) {
    for (const reg of registrations) {
      const { data: { user: userData } } = await serviceClient.auth.admin.getUserById(reg.user_id)
      if (userData?.email) {
        userEmails.set(reg.user_id, userData.email)
      }
    }
  }

  // Combine data
  const result = registrations.map((reg: any) => {
    const claims = menuClaims?.filter(c => c.registration_id === reg.id) || []
    const foodItems = claims.map((c: any) => ({
      name: c.menu_items?.name_en || c.menu_items?.name_kk || '',
      quantity: c.quantity
    }))

    return {
      id: reg.id,
      fullName: profilesMap.get(reg.user_id) || 'Unknown',
      email: userEmails.get(reg.user_id) || '',
      guestCount: reg.guest_count || 0,
      registeredAt: reg.registered_at,
      foodSelections: foodItems
    }
  })

  return {
    data: result,
    eventTitle: event.title_en || event.title_kk || 'Event'
  }
}
