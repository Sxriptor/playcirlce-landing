import { supabase } from '@/lib/supabase'

function createClient() {
  return supabase
}

export interface EventData {
  name: string
  description?: string
  sport: string
  event_type: string
  venue_id: string
  court_id?: string | null
  instructor_name?: string
  instructor_bio?: string
  start_date: string
  end_date?: string | null
  start_time: string
  end_time: string
  capacity: number
  price: number
  skill_level?: string
  age_group?: string
  equipment_provided?: boolean
  access_type?: string
  location?: string
  registration_closes?: string | null
  is_recurring?: boolean
  recurrence_pattern?: string | null
  recurrence_end_date?: string | null
  status?: string
}

export interface ClassData extends EventData {
  event_type: 'class' | 'lesson' | 'clinic' | 'camp'
}

export async function createEvent(eventData: EventData) {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return { success: false, error: 'Partner not found' }
    }

    // Create the event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        partner_id: partner.id,
        current_registrations: 0,
        status: eventData.status || 'scheduled'
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return { success: false, error: error.message }
    }

    return { success: true, event }
  } catch (error) {
    console.error('Unexpected error creating event:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPartnerEvents(eventType?: string) {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      throw new Error('Partner not found')
    }

    let query = supabase
      .from('events')
      .select('*')
      .eq('partner_id', partner.id)
      .order('start_date', { ascending: true })

    // Filter by event type if specified
    if (eventType) {
      query = query.eq('event_type', eventType)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      throw error
    }

    // Get venue names separately to avoid complex joins
    const venueIds = [...new Set(events.map(event => event.venue_id))]
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name')
      .in('id', venueIds)

    // Get court names separately if needed
    const courtIds = events.map(event => event.court_id).filter(Boolean)
    let courts: any[] = []
    if (courtIds.length > 0) {
      const { data: courtsData } = await supabase
        .from('courts')
        .select('id, name')
        .in('id', courtIds)
      courts = courtsData || []
    }

    // Transform the data to match the expected format
    const transformedEvents = events.map((event: any) => {
      const venue = venues?.find(v => v.id === event.venue_id)
      const court = courts.find(c => c.id === event.court_id)
      
      return {
        ...event,
        venue_name: venue?.name || 'Unknown Venue',
        court_name: court?.name || null
      }
    })

    return transformedEvents
  } catch (error) {
    console.error('Error in getPartnerEvents:', error)
    throw error
  }
}

export async function getPartnerClasses() {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      throw new Error('Partner not found')
    }

    // Filter for class-related event types: clinic, camp, workshop, class
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('partner_id', partner.id)
      .in('event_type', ['clinic', 'camp', 'workshop', 'class'])
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching classes:', error)
      throw error
    }

    // Get venue names separately to avoid complex joins
    const venueIds = [...new Set(events.map(event => event.venue_id))]
    const { data: venues } = await supabase
      .from('venues')
      .select('id, name')
      .in('id', venueIds)

    // Get court names separately if needed
    const courtIds = events.map(event => event.court_id).filter(Boolean)
    let courts: any[] = []
    if (courtIds.length > 0) {
      const { data: courtsData } = await supabase
        .from('courts')
        .select('id, name')
        .in('id', courtIds)
      courts = courtsData || []
    }

    // Transform the data to match the expected format
    const transformedEvents = events.map((event: any) => {
      const venue = venues?.find(v => v.id === event.venue_id)
      const court = courts.find(c => c.id === event.court_id)
      
      return {
        ...event,
        venue_name: venue?.name || 'Unknown Venue',
        court_name: court?.name || null
      }
    })

    return transformedEvents
  } catch (error) {
    console.error('Error in getPartnerClasses:', error)
    throw error
  }
}

export async function updateEvent(eventId: string, eventData: Partial<EventData>) {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID for security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return { success: false, error: 'Partner not found' }
    }

    // Update the event (RLS will ensure only partner's events can be updated)
    const { data: event, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .eq('partner_id', partner.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return { success: false, error: error.message }
    }

    return { success: true, event }
  } catch (error) {
    console.error('Unexpected error updating event:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID for security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return { success: false, error: 'Partner not found' }
    }

    // Delete the event (RLS will ensure only partner's events can be deleted)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('partner_id', partner.id)

    if (error) {
      console.error('Error deleting event:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error deleting event:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function toggleEventStatus(eventId: string) {
  const supabase = createClient()
  
  try {
    // Get the current user's partner ID for security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Get partner ID from user
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (partnerError || !partner) {
      return { success: false, error: 'Partner not found' }
    }

    // First get the current event to check its status
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('status')
      .eq('id', eventId)
      .eq('partner_id', partner.id)
      .single()

    if (fetchError || !currentEvent) {
      return { success: false, error: 'Event not found' }
    }

    // Toggle status between 'scheduled' and 'cancelled'
    const newStatus = currentEvent.status === 'scheduled' ? 'cancelled' : 'scheduled'

    // Update the event status
    const { data: event, error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', eventId)
      .eq('partner_id', partner.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error toggling event status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, event }
  } catch (error) {
    console.error('Unexpected error toggling event status:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}