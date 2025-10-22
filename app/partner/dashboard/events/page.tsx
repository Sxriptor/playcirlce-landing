'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Users,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { CreateEventOverlay } from '@/components/partner/overlays'
import { useTheme } from '@/components/partner/layout/ThemeProvider'
import { getThemeColors, themeColors } from '@/lib/theme-colors'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function EventsPage() {
  const { theme } = useTheme()
  const colors = getThemeColors(theme)
  const [showCreateEventOverlay, setShowCreateEventOverlay] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [eventToDelete, setEventToDelete] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const mockVenues: any[] = []
  const mockCourts: any[] = []

  // Fetch events from database
  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Error getting user:', userError)
        return
      }

      // Get partner ID for this user
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (partnerError || !partner) {
        console.error('Error fetching partner:', partnerError)
        return
      }

      // Fetch events for this partner with venue info
      // Only show events with event_type = tournament, league, match, social
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (
            id,
            name
          )
        `)
        .eq('partner_id', partner.id)
        .in('event_type', ['tournament', 'league', 'match', 'social'])
        .order('start_date', { ascending: true })

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
        return
      }

      // Map the data to include venue_name
      const mappedEvents = eventsData?.map(event => ({
        ...event,
        venue_name: event.venues?.name || 'Unknown Venue'
      })) || []

      console.log('Fetched events:', mappedEvents)
      setEvents(mappedEvents)
    } catch (error) {
      console.error('Error in fetchEvents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  const handleEventSubmit = async (eventData: any) => {
    console.log('New event data:', eventData)
    // Refresh events list after creating
    await fetchEvents()
  }

  const handleToggleEventStatus = async (event: any) => {
    try {
      // Toggle between 'published' and 'draft'
      const newStatus = event.status === 'published' ? 'draft' : 'published'
      
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', event.id)

      if (error) {
        console.error('Error updating event status:', error)
        toast({
          title: "Error",
          description: "Failed to update event status",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success!",
        description: `Event ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`,
      })
      
      // Reload events to reflect the change
      await fetchEvents()
    } catch (error) {
      console.error('Error toggling event status:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setShowCreateEventOverlay(true)
  }

  const handleCloseOverlay = () => {
    setShowCreateEventOverlay(false)
    setEditingEvent(null)
  }

  const confirmDeleteEvent = (event: any) => {
    setEventToDelete(event)
    setShowDeleteDialog(true)
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id)

      if (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: "Failed to delete event",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success!",
        description: "Event deleted successfully!",
      })
      
      setShowDeleteDialog(false)
      setEventToDelete(null)
      
      // Reload events to reflect the change
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const EventCard = ({ event }: any) => (
    <motion.div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(69, 104, 130, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${colors.cardBorder}`,
        backdropFilter: 'blur(20px)'
      }}
      whileHover={{ 
        y: -4,
        scale: 1.02
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
        background: theme === 'dark' ? 'radial-gradient(circle, rgba(69, 104, 130, 0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(69, 104, 130, 0.08) 0%, transparent 70%)',
        filter: 'blur(30px)'
      }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>{event.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                event.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                event.status === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                event.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {event.status}
              </span>
            </div>
            {event.description && (
              <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>{event.description}</p>
            )}
            <div className="flex items-center space-x-4 text-sm mb-3" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{event.start_date ? new Date(event.start_date + 'T00:00:00').toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{event.start_time} - {event.end_time}</span>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-sm" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{event.venue_name}</span>
              </div>
              <span>•</span>
              <span className="capitalize">{event.event_type.replace('_', ' ')}</span>
              <span>•</span>
              <span className="capitalize">{event.sport}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-2 transition-colors rounded-lg"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => confirmDeleteEvent(event)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {event.instructor_name && (
          <div className="mb-4 p-3 rounded-2xl" style={{ background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(69, 104, 130, 0.05)' }}>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              <span className="font-semibold">Instructor:</span> {event.instructor_name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{event.current_registrations || 0}/{event.capacity}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Registered</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>${event.price || 0}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Price</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {event.capacity > 0 ? Math.round(((event.current_registrations || 0) / event.capacity) * 100) : 0}%
            </p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Full</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: colors.textSecondary }}>
            <span className="capitalize">{event.skill_level ? event.skill_level.replace('_', ' ') : 'All Levels'}</span>
            {event.age_group && (
              <> • <span className="capitalize">{event.age_group.replace('_', ' ')}</span></>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleEventStatus(event)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                event.status === 'published'
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {event.status === 'published' ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {event.status === 'published' ? 'Published' : 'Unpublished'}
              </span>
            </button>
            <button 
              onClick={() => handleEditEvent(event)}
              className="p-2 transition-colors rounded-lg"
              style={{ color: colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Events</h1>
          <p style={{ color: colors.textSecondary }}>Organize workshops, clinics, and special events</p>
        </div>
        {events.length > 0 && (
          <motion.button
            onClick={() => setShowCreateEventOverlay(true)}
            className="text-white px-6 py-3 rounded-2xl flex items-center font-bold text-sm"
            style={{
              background: themeColors.accent,
              boxShadow: '0 8px 24px rgba(69, 104, 130, 0.4)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-2" />
            CREATE EVENT
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div
            className="rounded-3xl p-12 text-center max-w-md"
            style={{
              background: theme === 'dark' ? 'rgba(69, 104, 130, 0.1)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${colors.cardBorder}`,
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="mb-6">
              <div
                className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ background: theme === 'dark' ? 'rgba(69, 104, 130, 0.2)' : 'rgba(69, 104, 130, 0.1)' }}
              >
                <Calendar className="h-12 w-12" style={{ color: themeColors.accent }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>No Events Yet</h3>
              <p className="mb-6" style={{ color: colors.textSecondary }}>
                Get started by creating your first event. Host workshops, clinics, camps, and tournaments for your community.
              </p>
            </div>

            <motion.button
              onClick={() => setShowCreateEventOverlay(true)}
              className="text-white px-8 py-4 rounded-2xl flex items-center font-bold text-sm mx-auto"
              style={{
                background: themeColors.accent,
                boxShadow: '0 8px 24px rgba(69, 104, 130, 0.4)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-5 w-5 mr-2" />
              CREATE YOUR FIRST EVENT
            </motion.button>
          </div>
        </div>
      )}

      {/* Create Event Overlay */}
      <CreateEventOverlay
        isOpen={showCreateEventOverlay}
        onClose={handleCloseOverlay}
        onSubmit={handleEventSubmit}
        venues={mockVenues}
        courts={mockCourts}
        editingEvent={editingEvent}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="bg-gray-900 border-gray-700"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Remove Event - Dangerous Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <div className="space-y-3">
                <p>
                  You are about to permanently remove <strong className="text-white">"{eventToDelete?.name}"</strong>.
                </p>
                <div
                  className="p-4 rounded-lg border-l-4 border-red-500"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <p className="text-red-400 font-semibold mb-2">⚠️ This action will permanently remove:</p>
                  <ul className="text-sm text-gray-300 space-y-1 ml-4">
                    <li>• All registrations for this event</li>
                    <li>• All participant data and attendance records</li>
                    <li>• All event history and analytics</li>
                    <li>• Event schedule and pricing information</li>
                  </ul>
                </div>
                <p className="text-red-400 font-medium">
                  This action cannot be undone. Are you absolutely sure?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Remove Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}