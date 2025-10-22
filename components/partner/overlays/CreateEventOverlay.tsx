'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Trophy, DollarSign, X, Upload, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'

interface CreateEventOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: any) => void
  venues?: Array<{ id: string; name: string }>
  courts?: Array<{ id: string; name: string; venueId: string }>
  editingEvent?: any
}

export function CreateEventOverlay({
  isOpen,
  onClose,
  onSubmit,
  venues = [],
  courts = [],
  editingEvent = null
}: CreateEventOverlayProps) {

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'tournament',
    sport: 'tennis',
    venueId: '',
    courtIds: [] as string[],
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    entryFee: '',
    prizePool: '',
    registrationDeadline: '',
    skillLevel: 'all_levels',
    ageGroup: 'all_ages',
    format: '',
    sportFormatId: '',
    rules: '',
    requirements: [] as string[],
    equipmentProvidedList: [] as string[],
    equipmentRequired: '',
    location: '',
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [sportFormats, setSportFormats] = useState<Array<{
    id: string
    sport: string
    format_name: string
    format_type: string
    participant_count: number
    team_size: number | null
    is_preferred: boolean
    description: string
  }>>([])
  const [loading, setLoading] = useState(false)
  const [fetchedVenues, setFetchedVenues] = useState<Array<{ id: string; name: string }>>([])
  const [fetchedCourts, setFetchedCourts] = useState<Array<{ id: string; name: string; venueId: string; venue_id: string }>>([])
  const [loadingVenues, setLoadingVenues] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const eventTypes = [
    { value: 'tournament', label: 'Tournament' },
    { value: 'league', label: 'League' },
    { value: 'social', label: 'Social' },
    { value: 'match', label: 'Match' },
  ]

  const sportOptions = [
    { value: 'tennis', label: 'Tennis' },
    { value: 'padel', label: 'Padel' },
    { value: 'pickleball', label: 'Pickleball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'squash', label: 'Squash' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
  ]

  const skillLevels = [
    { value: 'all_levels', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' },
  ]

  const ageGroups = [
    { value: 'all_ages', label: 'All Ages' },
    { value: 'kids', label: 'Kids (Under 12)' },
    { value: 'teens', label: 'Teens (13-17)' },
    { value: 'adults', label: 'Adults (18+)' },
    { value: 'seniors', label: 'Seniors (55+)' },
  ]

  const equipmentOptions = [
    'Rackets',
    'Balls',
    'Nets',
    'Water Bottles',
    'Towels',
    'Training Cones',
    'Scorecards',
    'First Aid Kit',
  ]

  // Fetch partner's venues and courts when overlay opens
  useEffect(() => {
    const fetchVenuesAndCourts = async () => {
      if (!isOpen) return

      setLoadingVenues(true)
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.error('No authenticated user')
          return
        }

        // Get partner ID for this user
        const { data: partner, error: partnerError } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (partnerError) {
          console.error('Error fetching partner:', partnerError)
          return
        }

        if (!partner) {
          console.error('No partner found for user')
          return
        }

        // Fetch venues for this partner
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('id, name')
          .eq('partner_id', partner.id)
          .order('name', { ascending: true })

        if (venuesError) {
          console.error('Error fetching venues:', venuesError)
          return
        }

        console.log('Fetched venues:', venuesData)
        setFetchedVenues(venuesData || [])

        // Fetch all courts for this partner's venues
        if (venuesData && venuesData.length > 0) {
          const venueIds = venuesData.map(v => v.id)
          const { data: courtsData, error: courtsError } = await supabase
            .from('courts')
            .select('id, name, venue_id')
            .in('venue_id', venueIds)
            .order('name', { ascending: true })

          if (courtsError) {
            console.error('Error fetching courts:', courtsError)
            return
          }

          console.log('Fetched courts:', courtsData)
          // Map venue_id to venueId for compatibility
          const mappedCourts = courtsData?.map(court => ({
            ...court,
            venueId: court.venue_id
          })) || []
          setFetchedCourts(mappedCourts)
        }
      } catch (err) {
        console.error('Error in fetchVenuesAndCourts:', err)
      } finally {
        setLoadingVenues(false)
      }
    }

    fetchVenuesAndCourts()
  }, [isOpen])

  // Fetch sport formats when sport changes
  useEffect(() => {
    const fetchSportFormats = async () => {
      if (!formData.sport) return

      console.log('Fetching formats for sport:', formData.sport)
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('sport_formats')
          .select('*')
          .eq('sport', formData.sport)
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        if (error) {
          console.error('Error fetching sport formats:', error)
          return
        }

        console.log('Fetched sport formats:', data)
        setSportFormats(data || [])

        // Auto-select preferred format if available
        const preferredFormat = data?.find(f => f.is_preferred)
        console.log('Preferred format:', preferredFormat)
        if (preferredFormat) {
          console.log('Auto-selecting preferred format with', preferredFormat.participant_count, 'participants')
          setFormData(prev => ({
            ...prev,
            format: preferredFormat.format_name,
            sportFormatId: preferredFormat.id,
            maxParticipants: preferredFormat.participant_count.toString()
          }))
        } else if (data && data.length > 0) {
          // If no preferred format, select the first one
          console.log('No preferred format, selecting first format')
          setFormData(prev => ({
            ...prev,
            format: data[0].format_name,
            sportFormatId: data[0].id,
            maxParticipants: data[0].participant_count.toString()
          }))
        }
      } catch (err) {
        console.error('Error fetching sport formats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSportFormats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sport])

  // Auto-populate location from selected venue
  useEffect(() => {
    const fetchVenueLocation = async () => {
      if (!formData.venueId) {
        setFormData(prev => ({ ...prev, location: '' }))
        return
      }

      try {
        const { data: venue, error } = await supabase
          .from('venues')
          .select('address, city, state, postal_code')
          .eq('id', formData.venueId)
          .single()

        if (error) {
          console.error('Error fetching venue location:', error)
          return
        }

        if (venue) {
          // Build location string from venue data
          const locationParts = [
            venue.address,
            venue.city,
            venue.state,
            venue.postal_code
          ].filter(Boolean)
          
          const locationString = locationParts.join(', ')
          setFormData(prev => ({ ...prev, location: locationString }))
        }
      } catch (err) {
        console.error('Error in fetchVenueLocation:', err)
      }
    }

    fetchVenueLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.venueId])

  // Populate form when editing an event
  useEffect(() => {
    if (editingEvent && isOpen) {
      console.log('Populating form with editing event:', editingEvent)
      setFormData({
        title: editingEvent.name || '',
        description: editingEvent.description || '',
        eventType: editingEvent.event_type || 'tournament',
        sport: editingEvent.sport || 'tennis',
        venueId: editingEvent.venue_id || '',
        courtIds: [], // TODO: Load associated courts if needed
        startDate: editingEvent.start_date || '',
        endDate: editingEvent.end_date || '',
        startTime: editingEvent.start_time || '',
        endTime: editingEvent.end_time || '',
        maxParticipants: editingEvent.capacity?.toString() || '',
        entryFee: editingEvent.price?.toString() || '',
        prizePool: '', // Not stored in events table
        registrationDeadline: editingEvent.registration_deadline ? editingEvent.registration_deadline.split('T')[0] : '',
        skillLevel: editingEvent.skill_level || 'all_levels',
        ageGroup: editingEvent.age_group || 'all_ages',
        format: editingEvent.match_format || '',
        sportFormatId: editingEvent.sport_format_id || '',
        rules: '', // Not stored in events table
        requirements: editingEvent.requirements || [],
        equipmentProvidedList: editingEvent.equipment_provided_list || [],
        equipmentRequired: editingEvent.equipment_required || '',
        location: editingEvent.location || '',
      })
    } else if (!isOpen) {
      // Reset form when closing
      setFormData({
        title: '',
        description: '',
        eventType: 'tournament',
        sport: 'tennis',
        venueId: '',
        courtIds: [],
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        maxParticipants: '',
        entryFee: '',
        prizePool: '',
        registrationDeadline: '',
        skillLevel: 'all_levels',
        ageGroup: 'all_ages',
        format: '',
        sportFormatId: '',
        rules: '',
        requirements: [],
        equipmentProvidedList: [],
        equipmentRequired: '',
        location: '',
      })
    }
  }, [editingEvent, isOpen])

  const requirementOptions = [
    'Valid ID Required',
    'Waiver Must Be Signed',
    'Equipment Provided',
    'Bring Own Equipment',
    'Medical Clearance Required',
    'Age Verification Required',
    'Skill Level Verification',
    'Registration Fee Non-Refundable'
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    // If sport changes, reset format and maxParticipants
    if (field === 'sport') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        format: '',
        sportFormatId: '',
        maxParticipants: ''
      }))
    }
    // If venue changes, reset court selection
    else if (field === 'venueId') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        courtIds: []
      }))
    }
    else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleFormatChange = (formatName: string) => {
    console.log('Format changed to:', formatName)
    console.log('Available sportFormats:', sportFormats)
    const selectedFormat = sportFormats.find(f => f.format_name === formatName)
    console.log('Selected format:', selectedFormat)
    if (selectedFormat) {
      console.log('Setting maxParticipants to:', selectedFormat.participant_count)
      setFormData(prev => ({
        ...prev,
        format: formatName,
        sportFormatId: selectedFormat.id,
        maxParticipants: selectedFormat.participant_count.toString()
      }))
    } else {
      console.log('No format found!')
    }
  }

  const handleCourtSelection = (courtId: string) => {
    setFormData(prev => ({
      ...prev,
      courtIds: prev.courtIds.includes(courtId)
        ? prev.courtIds.filter(id => id !== courtId)
        : [...prev.courtIds, courtId]
    }))
  }

  const handleRequirementToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement]
    }))
  }

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipmentProvidedList: prev.equipmentProvidedList.includes(equipment)
        ? prev.equipmentProvidedList.filter(e => e !== equipment)
        : [...prev.equipmentProvidedList, equipment]
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      alert('Image size must be less than 5MB')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const uploadImageToStorage = async (partnerId: string, eventId: string): Promise<string | null> => {
    if (!selectedImage) return null

    try {
      setUploadingImage(true)

      // Create file path: {partner_id}/{event_id}/main.{extension}
      const fileExt = selectedImage.name.split('.').pop()
      const filePath = `${partnerId}/${eventId}/main.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('events-images')
        .upload(filePath, selectedImage, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        })

      if (error) {
        console.error('Error uploading image:', error)
        throw error
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('events-images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error in uploadImageToStorage:', error)
      alert('Failed to upload image. The event will be created without an image.')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('Error getting user:', userError)
        alert('You must be logged in to create events')
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
        alert('Partner account not found')
        return
      }

      // Combine date and time into timestamps
      const startTimestamp = formData.startDate && formData.startTime
        ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
        : null

      const endTimestamp = formData.endDate && formData.endTime
        ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
        : null

      const registrationDeadlineTimestamp = formData.registrationDeadline
        ? new Date(formData.registrationDeadline).toISOString()
        : null

      // Prepare event data matching the database schema
      const eventData = {
        // Required fields
        partner_id: partner.id,
        venue_id: formData.venueId,
        sport: formData.sport,
        event_type: formData.eventType,
        name: formData.title,

        // Sport format
        sport_format_id: formData.sportFormatId || null,
        match_format: formData.format || null,

        // Event details
        title: formData.title, // Alias for mobile app
        description: formData.description || null,

        // Scheduling
        start_date: formData.startDate,
        end_date: formData.endDate,
        start_time: formData.startTime,
        end_time: formData.endTime,
        start_timestamp: startTimestamp,
        end_timestamp: endTimestamp,

        // Participation and pricing
        capacity: parseInt(formData.maxParticipants) || 0,
        max_participants: parseInt(formData.maxParticipants) || null, // Alias
        price: parseFloat(formData.entryFee) || 0,

        // Registration
        registration_deadline: registrationDeadlineTimestamp,
        registration_closes: registrationDeadlineTimestamp,

        // Requirements and details
        skill_level: formData.skillLevel,
        age_group: formData.ageGroup,
        requirements: formData.requirements.length > 0 ? formData.requirements : null,

        // Location
        location: formData.location || null,

        // Status
        status: 'published', // Set to published so it's visible

        // Equipment handling
        equipment_provided: formData.equipmentProvidedList.length > 0 || formData.requirements.includes('Equipment Provided'),
        equipment_provided_list: formData.equipmentProvidedList.length > 0 ? formData.equipmentProvidedList : null,
        equipment_required: formData.equipmentRequired || 
          (formData.requirements.includes('Bring Own Equipment') ? 'Please bring your own equipment' : null)
      }

      console.log(editingEvent ? 'Updating event with data:' : 'Creating event with data:', eventData)

      let createdOrUpdatedEventId: string | null = null

      if (editingEvent) {
        // Update existing event
        const { data: updatedEvent, error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating event:', updateError)
          alert(`Failed to update event: ${updateError.message}`)
          return
        }

        console.log('Event updated successfully:', updatedEvent)
        createdOrUpdatedEventId = updatedEvent.id

        // Upload image if selected
        if (selectedImage) {
          const imageUrl = await uploadImageToStorage(partner.id, createdOrUpdatedEventId)
          if (imageUrl) {
            // Update event with image URL
            await supabase
              .from('events')
              .update({ image_url: imageUrl })
              .eq('id', createdOrUpdatedEventId)
          }
        }

        alert('Event updated successfully!')
      } else {
        // Insert new event into database
        const { data: newEvent, error: insertError } = await supabase
          .from('events')
          .insert([eventData])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating event:', insertError)
          alert(`Failed to create event: ${insertError.message}`)
          return
        }

        console.log('Event created successfully:', newEvent)
        createdOrUpdatedEventId = newEvent.id

        // Upload image if selected
        if (selectedImage) {
          const imageUrl = await uploadImageToStorage(partner.id, createdOrUpdatedEventId)
          if (imageUrl) {
            // Update event with image URL
            await supabase
              .from('events')
              .update({ image_url: imageUrl })
              .eq('id', createdOrUpdatedEventId)
          }
        }

        alert('Event created successfully!')
      }

      // Call the onSubmit callback if provided (for parent component updates)
      onSubmit(formData)

      // Close and reset form
      onClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      alert('An unexpected error occurred while creating the event')
    } finally {
      setSubmitting(false)
    }
  }

  // Use fetched venues/courts if available, otherwise use props
  const displayVenues = fetchedVenues.length > 0 ? fetchedVenues : venues
  const displayCourts = fetchedCourts.length > 0 ? fetchedCourts : courts

  const availableCourts = displayCourts.filter(court =>
    formData.venueId ? court.venueId === formData.venueId : true
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw]"
        style={{
          background: 'rgba(5, 10, 15, 0.95)',
          border: '1px solid rgba(69, 104, 130, 0.3)',
          backdropFilter: 'blur(20px)'
        }}
        showCloseButton={false}
      >
        <DialogHeader className="relative">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(69, 104, 130, 0.2)' }}>
              <Trophy className="h-6 w-6" style={{ color: '#456882' }} />
            </div>
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingEvent ? 'Update your event details' : 'Create a tournament, league, or special event at your venue'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Event Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Summer Tennis Championship"
                required
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sport * <span className="text-xs text-gray-400">(Select first)</span>
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sportOptions.map((sport) => (
                    <option key={sport.value} value={sport.value} className="bg-gray-800">
                      {sport.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {skillLevels.map((level) => (
                    <option key={level.value} value={level.value} className="bg-gray-800">
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age Group
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ageGroups.map((group) => (
                  <option key={group.value} value={group.value} className="bg-gray-800">
                    {group.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event, format, prizes, and what participants can expect..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Image (Optional)
              </label>
              <div className="space-y-3">
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="event-image-upload"
                    />
                    <label
                      htmlFor="event-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors bg-white/5"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Click to upload event image</p>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, or GIF (max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-48 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Venue and Courts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Location</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Venue *
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => handleInputChange('venueId', e.target.value)}
                required
                disabled={loadingVenues}
                className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingVenues ? 'Loading venues...' : displayVenues.length === 0 ? 'No venues available' : 'Select a venue'}
                </option>
                {displayVenues.map((venue) => (
                  <option key={venue.id} value={venue.id} className="bg-gray-800">
                    {venue.name}
                  </option>
                ))}
              </select>
              {!loadingVenues && displayVenues.length === 0 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Please create a venue first before creating events
                </p>
              )}
            </div>

            {formData.venueId && formData.location && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address <span className="text-xs text-gray-400">(Auto-populated from venue)</span>
                </label>
                <Input
                  value={formData.location}
                  readOnly
                  className="bg-white/5 border-white/10 text-gray-400 cursor-not-allowed"
                />
              </div>
            )}

            {formData.venueId && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Courts (Optional - Select one or more)
                </label>
                {availableCourts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableCourts.map((court) => (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => handleCourtSelection(court.id)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          formData.courtIds.includes(court.id)
                            ? 'text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        style={{
                          background: formData.courtIds.includes(court.id)
                            ? '#456882'
                            : 'rgba(69, 104, 130, 0.1)',
                          border: `1px solid ${formData.courtIds.includes(court.id)
                            ? '#456882'
                            : 'rgba(69, 104, 130, 0.2)'}`
                        }}
                      >
                        {court.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 p-4 bg-white/5 rounded-lg border border-white/10">
                    No courts available for this venue. You can still create the event without specific court assignments.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Registration Deadline
              </label>
              <Input
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Participants and Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants & Pricing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants <span className="text-xs text-gray-400">(Auto-populated)</span>
                </label>
                <Input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  placeholder="Select format first"
                  min="1"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
                {formData.format && (
                  <p className="text-xs text-gray-400 mt-1">
                    Based on {formData.format} format
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entry Fee ($)
                </label>
                <Input
                  type="number"
                  value={formData.entryFee}
                  onChange={(e) => handleInputChange('entryFee', e.target.value)}
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prize Pool ($)
                </label>
                <Input
                  type="number"
                  value={formData.prizePool}
                  onChange={(e) => handleInputChange('prizePool', e.target.value)}
                  placeholder="500.00"
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Format *
              </label>
              <select
                value={formData.format}
                onChange={(e) => handleFormatChange(e.target.value)}
                required
                disabled={loading || sportFormats.length === 0}
                className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading ? 'Loading formats...' : sportFormats.length === 0 ? 'No formats available' : 'Select format'}
                </option>
                {sportFormats.map((format) => (
                  <option key={format.id} value={format.format_name} className="bg-gray-800">
                    {format.format_name} {format.is_preferred ? '(Preferred)' : ''} - {format.participant_count} players
                  </option>
                ))}
              </select>
              {formData.format && (
                <p className="text-xs text-gray-400 mt-1">
                  {sportFormats.find(f => f.format_name === formData.format)?.description}
                </p>
              )}
            </div>
          </div>

          {/* Rules and Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Rules & Requirements</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Rules
              </label>
              <Textarea
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Specify tournament format, scoring system, dress code, and any special rules..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requirementOptions.map((requirement) => (
                  <button
                    key={requirement}
                    type="button"
                    onClick={() => handleRequirementToggle(requirement)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                      formData.requirements.includes(requirement)
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      background: formData.requirements.includes(requirement)
                        ? '#456882'
                        : 'rgba(69, 104, 130, 0.1)',
                      border: `1px solid ${formData.requirements.includes(requirement)
                        ? '#456882'
                        : 'rgba(69, 104, 130, 0.2)'}`
                    }}
                  >
                    {requirement}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment Provided
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {equipmentOptions.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleEquipmentToggle(equipment)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all text-center ${
                      formData.equipmentProvidedList.includes(equipment)
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      background: formData.equipmentProvidedList.includes(equipment)
                        ? '#456882'
                        : 'rgba(69, 104, 130, 0.1)',
                      border: `1px solid ${formData.equipmentProvidedList.includes(equipment)
                        ? '#456882'
                        : 'rgba(69, 104, 130, 0.2)'}`
                    }}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
              {formData.equipmentProvidedList.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {formData.equipmentProvidedList.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Equipment Required (What participants need to bring)
              </label>
              <Textarea
                value={formData.equipmentRequired}
                onChange={(e) => handleInputChange('equipmentRequired', e.target.value)}
                placeholder="e.g., Tennis racket, appropriate athletic shoes, water bottle..."
                rows={2}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingImage}
              className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#456882',
                boxShadow: '0 4px 12px rgba(69, 104, 130, 0.3)'
              }}
            >
              {uploadingImage ? 'Uploading Image...' : submitting ? (editingEvent ? 'Updating Event...' : 'Creating Event...') : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}