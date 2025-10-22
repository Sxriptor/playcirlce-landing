import { createClient } from '@supabase/supabase-js'
import { getCurrentPartner } from './venues'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface MatchData {
  title: string
  description?: string
  matchType: string
  sport: string
  accessType: string
  venueId: string
  courtId: string
  scheduledDate: string
  startTime: string
  endTime: string
  timezone?: string
  maxPlayers: string
  entryFee?: string
  prizePool?: string
  registrationDeadline?: string
  skillLevel: string
  format: string
  rules?: string
  requirements: string[]
  image_url?: string
}

export async function createMatch(matchData: MatchData): Promise<{ success: boolean; error?: string; match?: any }> {
  try {
    console.log('Starting match creation with data:', matchData)
    
    // Get current partner
    const partner = await getCurrentPartner()
    console.log('Current partner:', partner)
    
    if (!partner) {
      console.error('No partner found')
      return { success: false, error: 'No partner found. Please ensure you are logged in as a partner.' }
    }

    // Verify that the venue belongs to the current partner
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, partner_id')
      .eq('id', matchData.venueId)
      .eq('partner_id', partner.id)
      .single()

    if (venueError || !venue) {
      console.error('Venue not found or not owned by partner:', venueError)
      return { success: false, error: 'Venue not found or you do not have permission to create matches at this venue.' }
    }

    // Verify that the court belongs to the venue
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('id, venue_id')
      .eq('id', matchData.courtId)
      .eq('venue_id', matchData.venueId)
      .single()

    if (courtError || !court) {
      console.error('Court not found or not in venue:', courtError)
      return { success: false, error: 'Court not found or does not belong to the selected venue.' }
    }

    // Prepare rules as JSON object
    const rulesJson = matchData.rules ? {
      text: matchData.rules,
      updated_at: new Date().toISOString()
    } : null

    // Prepare requirements as JSON array
    const requirementsJson = matchData.requirements && matchData.requirements.length > 0 
      ? matchData.requirements 
      : null

    // Prepare match data for database
    const matchPayload: any = {
      partner_id: partner.id,
      venue_id: matchData.venueId,
      court_id: matchData.courtId,
      title: matchData.title,
      description: matchData.description || null,
      sport: matchData.sport,
      scheduled_date: matchData.scheduledDate,
      start_time: matchData.startTime,
      end_time: matchData.endTime,
      timezone: matchData.timezone || 'UTC',
      match_type: matchData.matchType,
      skill_level: matchData.skillLevel,
      access_type: matchData.accessType,
      max_players: parseInt(matchData.maxPlayers),
      current_players: 0,
      entry_fee: matchData.entryFee ? parseFloat(matchData.entryFee) : 0,
      prize_pool: matchData.prizePool ? parseFloat(matchData.prizePool) : 0,
      registration_deadline: matchData.registrationDeadline ? new Date(matchData.registrationDeadline).toISOString() : null,
      status: 'scheduled',
      rules: rulesJson,
      requirements: requirementsJson
    }
    
    // Add image URL if provided
    if (matchData.image_url) {
      matchPayload.image_url = matchData.image_url
    }

    console.log('Match payload for database:', matchPayload)

    // Insert match into database
    const { data: match, error } = await supabase
      .from('matches')
      .insert([matchPayload])
      .select(`
        *,
        venues!inner (
          id,
          name,
          partner_id
        ),
        courts (
          id,
          name
        )
      `)
      .single()

    console.log('Supabase insert result:', { match, error })

    if (error) {
      console.error('Error creating match:', error)
      return { success: false, error: error.message }
    }

    console.log('Match creation successful:', match)
    return { success: true, match }
  } catch (error) {
    console.error('Error in createMatch:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getPartnerMatches(partnerId?: string): Promise<any[]> {
  try {
    let query = supabase
      .from('matches')
      .select(`
        *,
        venues!inner (
          id,
          name,
          partner_id
        ),
        courts (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (partnerId) {
      query = query.eq('venues.partner_id', partnerId)
    } else {
      // Get current partner's matches
      const partner = await getCurrentPartner()
      if (!partner) return []
      query = query.eq('venues.partner_id', partner.id)
    }

    const { data: matches, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return []
    }

    return matches || []
  } catch (error) {
    console.error('Error in getPartnerMatches:', error)
    return []
  }
}

export async function updateMatch(matchId: string, matchData: Partial<MatchData>): Promise<{ success: boolean; error?: string; match?: any }> {
  try {
    console.log('Starting match update with data:', matchData)
    
    // Get current partner
    const partner = await getCurrentPartner()
    
    if (!partner) {
      console.error('No partner found')
      return { success: false, error: 'No partner found. Please ensure you are logged in as a partner.' }
    }

    // Prepare update payload (only include fields that are provided)
    const updatePayload: any = {}
    
    if (matchData.title !== undefined) updatePayload.title = matchData.title
    if (matchData.description !== undefined) updatePayload.description = matchData.description
    if (matchData.sport !== undefined) updatePayload.sport = matchData.sport
    if (matchData.scheduledDate !== undefined) updatePayload.scheduled_date = matchData.scheduledDate
    if (matchData.startTime !== undefined) updatePayload.start_time = matchData.startTime
    if (matchData.endTime !== undefined) updatePayload.end_time = matchData.endTime
    if (matchData.matchType !== undefined) updatePayload.match_type = matchData.matchType
    if (matchData.skillLevel !== undefined) updatePayload.skill_level = matchData.skillLevel
    if (matchData.accessType !== undefined) updatePayload.access_type = matchData.accessType
    if (matchData.maxPlayers !== undefined) updatePayload.max_players = parseInt(matchData.maxPlayers)
    if (matchData.entryFee !== undefined) updatePayload.entry_fee = matchData.entryFee ? parseFloat(matchData.entryFee) : 0
    if (matchData.prizePool !== undefined) updatePayload.prize_pool = matchData.prizePool ? parseFloat(matchData.prizePool) : 0
    if (matchData.registrationDeadline !== undefined) {
      updatePayload.registration_deadline = matchData.registrationDeadline ? new Date(matchData.registrationDeadline).toISOString() : null
    }
    
    // Handle rules as JSON if provided
    if (matchData.rules !== undefined) {
      updatePayload.rules = matchData.rules ? {
        text: matchData.rules,
        updated_at: new Date().toISOString()
      } : null
    }
    
    // Handle requirements as JSON array if provided
    if (matchData.requirements !== undefined) {
      updatePayload.requirements = matchData.requirements && matchData.requirements.length > 0 
        ? matchData.requirements 
        : null
    }
    
    // Handle image URL if provided
    if (matchData.image_url !== undefined) {
      updatePayload.image_url = matchData.image_url
    }
    
    updatePayload.updated_at = new Date().toISOString()

    console.log('Match update payload:', updatePayload)

    // Update match in database - RLS will ensure only partner's matches can be updated
    const { data: match, error } = await supabase
      .from('matches')
      .update(updatePayload)
      .eq('id', matchId)
      .select(`
        *,
        venues!inner (
          id,
          name,
          partner_id
        ),
        courts (
          id,
          name
        )
      `)
      .single()

    console.log('Supabase update result:', { match, error })

    if (error) {
      console.error('Error updating match:', error)
      return { success: false, error: error.message }
    }

    // Verify the match belongs to the partner
    if (match.venues.partner_id !== partner.id) {
      console.error('Match does not belong to partner')
      return { success: false, error: 'You do not have permission to update this match.' }
    }

    console.log('Match update successful:', match)
    return { success: true, match }
  } catch (error) {
    console.error('Error in updateMatch:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteMatch(matchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Deleting match:', matchId)
    
    // Get current partner
    const partner = await getCurrentPartner()
    
    if (!partner) {
      console.error('No partner found')
      return { success: false, error: 'No partner found. Please ensure you are logged in as a partner.' }
    }

    // Delete match from database - RLS will ensure only partner's matches can be deleted
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)

    console.log('Supabase delete result:', { error })

    if (error) {
      console.error('Error deleting match:', error)
      return { success: false, error: error.message }
    }

    console.log('Match deletion successful')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteMatch:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function toggleMatchStatus(matchId: string): Promise<{ success: boolean; error?: string; match?: any }> {
  try {
    console.log('Toggling match active status for:', matchId)
    
    // Get current partner
    const partner = await getCurrentPartner()
    
    if (!partner) {
      console.error('No partner found')
      return { success: false, error: 'No partner found. Please ensure you are logged in as a partner.' }
    }

    // First get the current match to check its is_active status
    const { data: currentMatch, error: fetchError } = await supabase
      .from('matches')
      .select(`
        is_active,
        venues!inner (
          partner_id
        )
      `)
      .eq('id', matchId)
      .single()

    if (fetchError) {
      console.error('Error fetching current match:', fetchError)
      return { success: false, error: fetchError.message }
    }

    // Verify the match belongs to the partner
    if (currentMatch.venues.partner_id !== partner.id) {
      console.error('Match does not belong to partner')
      return { success: false, error: 'You do not have permission to update this match.' }
    }

    // Toggle the is_active status
    const newActiveStatus = !currentMatch.is_active
    console.log('Toggling is_active from', currentMatch.is_active, 'to', newActiveStatus)

    // Update match active status
    const { data: match, error } = await supabase
      .from('matches')
      .update({ 
        is_active: newActiveStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single()

    console.log('Supabase toggle result:', { match, error })

    if (error) {
      console.error('Error toggling match active status:', error)
      return { success: false, error: error.message }
    }

    console.log('Match active status toggle successful:', match)
    return { success: true, match }
  } catch (error) {
    console.error('Error in toggleMatchStatus:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}