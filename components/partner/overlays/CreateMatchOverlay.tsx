'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Trophy, DollarSign, X, Target, Upload, Image as ImageIcon } from 'lucide-react'
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
import React from 'react'

interface CreateMatchOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (matchData: any) => void
  venues?: Array<{ id: string; name: string }>
  courts?: Array<{ id: string; name: string; venueId: string }>
  editingMatch?: any
}

export function CreateMatchOverlay({ 
  isOpen, 
  onClose, 
  onSubmit, 
  venues = [], 
  courts = [],
  editingMatch = null
}: CreateMatchOverlayProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    matchType: 'singles',
    sport: 'tennis',
    accessType: 'reserve',
    venueId: '',
    courtId: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    maxPlayers: '',
    entryFee: '',
    prizePool: '',
    registrationDeadline: '',
    skillLevel: 'intermediate',
    format: 'elimination',
    rules: '',
    requirements: [] as string[],
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const sportOptions = [
    { value: 'tennis', label: 'Tennis' },
    { value: 'pickleball', label: 'Pickleball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'squash', label: 'Squash' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
  ]

  // Get available match types based on selected sport
  const getMatchTypesForSport = (sport: string) => {
    switch (sport) {
      case 'tennis':
        return [
          { value: 'singles', label: 'Singles (1v1)' },
          { value: 'doubles', label: 'Doubles (2v2)' },
        ]
      case 'pickleball':
        return [
          { value: 'doubles', label: 'Doubles (2v2 - Preferred)' },
        ]
      case 'badminton':
        return [
          { value: 'singles', label: 'Singles (1v1)' },
          { value: 'doubles', label: 'Doubles (2v2)' },
        ]
      case 'squash':
        return [
          { value: 'singles', label: 'Singles (1v1)' },
        ]
      case 'basketball':
        return [
          { value: 'regular', label: '5v5 (Full Court)' },
          { value: 'doubles', label: '3v3 (Half Court)' },
        ]
      case 'volleyball':
        return [
          { value: 'regular', label: 'Indoor (6v6)' },
          { value: 'doubles', label: 'Beach (2v2)' },
        ]
      default:
        return []
    }
  }

  // Get match configuration based on sport and match type
  const getMatchConfig = (sport: string, matchType: string) => {
    const configs: { [key: string]: { [key: string]: { maxPlayers: string; format: string } } } = {
      tennis: {
        singles: { maxPlayers: '2', format: 'singles' },
        doubles: { maxPlayers: '4', format: 'doubles' },
      },
      pickleball: {
        doubles: { maxPlayers: '4', format: 'doubles' },
      },
      badminton: {
        singles: { maxPlayers: '2', format: 'singles' },
        doubles: { maxPlayers: '4', format: 'doubles' },
      },
      squash: {
        singles: { maxPlayers: '2', format: 'singles' },
      },
      basketball: {
        regular: { maxPlayers: '10', format: 'full-court' },
        doubles: { maxPlayers: '6', format: 'half-court' },
      },
      volleyball: {
        regular: { maxPlayers: '12', format: 'indoor' },
        doubles: { maxPlayers: '4', format: 'beach' },
      },
    }
    
    return configs[sport]?.[matchType] || { maxPlayers: '4', format: 'casual' }
  }

  const accessTypes = [
    { value: 'reserve', label: 'Reserve (Mobile App Booking)' },
    { value: 'open', label: 'Open (Walk-in)' },
  ]

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'open', label: 'Open (All Levels)' },
  ]

  // Get format display name
  const getFormatDisplayName = (format: string) => {
    const formatNames: { [key: string]: string } = {
      'singles': 'Singles Format',
      'doubles': 'Doubles Format', 
      'full-court': '5v5 Full Court',
      'half-court': '3v3 Half Court',
      'indoor': '6v6 Indoor',
      'beach': '2v2 Beach',
      'elimination': 'Tournament Elimination',
      'casual': 'Casual Play'
    }
    return formatNames[format] || format
  }

  const requirementOptions = [
    'Valid ID Required',
    'Waiver Must Be Signed',
    'Equipment Provided',
    'Bring Own Equipment',
    'Skill Level Verification',
    'Registration Fee Non-Refundable',
    'No Late Entries',
    'Punctuality Required'
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // When sport changes, reset match type and set first available option
      if (field === 'sport') {
        const availableMatchTypes = getMatchTypesForSport(value as string)
        if (availableMatchTypes.length > 0) {
          const firstMatchType = availableMatchTypes[0].value
          newData.matchType = firstMatchType
          
          // Set config for the first match type
          const config = getMatchConfig(value as string, firstMatchType)
          newData.maxPlayers = config.maxPlayers
          newData.format = config.format
        }
      }
      
      // When match type changes, update max players and format
      if (field === 'matchType') {
        const config = getMatchConfig(newData.sport, value as string)
        newData.maxPlayers = config.maxPlayers
        newData.format = config.format
      }
      
      return newData
    })
  }

  const handleRequirementToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(requirement)
        ? prev.requirements.filter(r => r !== requirement)
        : [...prev.requirements, requirement]
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

  const uploadImageToStorage = async (partnerId: string, matchId: string): Promise<string | null> => {
    if (!selectedImage) return null

    try {
      setUploadingImage(true)

      // Create file path: {partner_id}/{match_id}/main.{extension}
      const fileExt = selectedImage.name.split('.').pop()
      const filePath = `${partnerId}/${matchId}/main.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('matches-images')
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
        .from('matches-images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error in uploadImageToStorage:', error)
      alert('Failed to upload image. The match will be created without an image.')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate skill level - ensure it's one of the allowed values
    const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'open']
    const sanitizedFormData = {
      ...formData,
      skillLevel: validSkillLevels.includes(formData.skillLevel) 
        ? formData.skillLevel 
        : 'open' // Default to 'open' if invalid
    }
    
    // Include match ID if editing
    const submitData = editingMatch 
      ? { ...sanitizedFormData, matchId: editingMatch.id }
      : sanitizedFormData
    
    onSubmit(submitData)
  }

  // Reset form when overlay opens, then populate if editing
  React.useEffect(() => {
    if (isOpen) {
      if (editingMatch) {
        // Validate and sanitize skill level
        const validSkillLevels = ['beginner', 'intermediate', 'advanced', 'open']
        const sanitizedSkillLevel = validSkillLevels.includes(editingMatch.skill_level) 
          ? editingMatch.skill_level 
          : 'open'
        
        // Parse rules from JSON
        let rulesText = ''
        if (editingMatch.rules) {
          if (typeof editingMatch.rules === 'string') {
            rulesText = editingMatch.rules
          } else if (editingMatch.rules.text) {
            rulesText = editingMatch.rules.text
          }
        }

        // Parse requirements from JSON
        let requirementsArray: string[] = []
        if (editingMatch.requirements) {
          if (Array.isArray(editingMatch.requirements)) {
            requirementsArray = editingMatch.requirements
          }
        }

        setFormData({
          title: editingMatch.title || '',
          description: editingMatch.description || '',
          matchType: editingMatch.match_type || 'singles',
          sport: editingMatch.sport || 'tennis',
          accessType: editingMatch.access_type || 'reserve',
          venueId: editingMatch.venue_id || '',
          courtId: editingMatch.court_id || '',
          scheduledDate: editingMatch.scheduled_date || '',
          startTime: editingMatch.start_time || '',
          endTime: editingMatch.end_time || '',
          maxPlayers: editingMatch.max_players?.toString() || '',
          entryFee: editingMatch.entry_fee?.toString() || '',
          prizePool: editingMatch.prize_pool?.toString() || '',
          registrationDeadline: editingMatch.registration_deadline ? editingMatch.registration_deadline.split('T')[0] : '',
          skillLevel: sanitizedSkillLevel,
          format: editingMatch.format || 'singles',
          rules: rulesText,
          requirements: requirementsArray,
        })
        
        // Reset image state when editing
        setSelectedImage(null)
        setImagePreview(null)
      } else {
        // Reset form for new match creation
        setFormData({
          title: '',
          description: '',
          matchType: 'singles',
          sport: 'tennis',
          accessType: 'reserve',
          venueId: '',
          courtId: '',
          scheduledDate: '',
          startTime: '',
          endTime: '',
          maxPlayers: '',
          entryFee: '',
          prizePool: '',
          registrationDeadline: '',
          skillLevel: 'intermediate',
          format: 'singles',
          rules: '',
          requirements: [],
        })
        
        // Reset image state
        setSelectedImage(null)
        setImagePreview(null)
      }
    }
  }, [isOpen, editingMatch])

  const availableCourts = courts.filter(court => 
    formData.venueId ? court.venueId === formData.venueId : true
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="!max-w-5xl max-h-[90vh] overflow-y-auto w-[95vw]"
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
              <Target className="h-6 w-6" style={{ color: '#456882' }} />
            </div>
            {editingMatch ? 'Edit Match' : 'Create New Match'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingMatch 
              ? 'Update match details and settings'
              : 'Organize a competitive match or tournament at your venue'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Match Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Singles Championship Final"
                required
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Type *
              </label>
              <select
                value={formData.accessType}
                onChange={(e) => handleInputChange('accessType', e.target.value)}
                required
                className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {accessTypes.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-800">
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                {formData.accessType === 'reserve' 
                  ? 'Players book and pay through the mobile app' 
                  : 'Walk-in match - no advance booking required'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sport *
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
                  Match Type *
                </label>
                <select
                  value={formData.matchType}
                  onChange={(e) => handleInputChange('matchType', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getMatchTypesForSport(formData.sport).map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level *
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                  required
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
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the match format, competition level, and what players can expect..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Image (Optional)
              </label>
              <div className="space-y-3">
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="match-image-upload"
                    />
                    <label
                      htmlFor="match-image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors bg-white/5"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-400">Click to upload match image</p>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, or GIF (max 5MB)</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Match preview"
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

          {/* Venue and Court */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue *
                </label>
                <select
                  value={formData.venueId}
                  onChange={(e) => handleInputChange('venueId', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id} className="bg-gray-800">
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Court *
                </label>
                <select
                  value={formData.courtId}
                  onChange={(e) => handleInputChange('courtId', e.target.value)}
                  required
                  disabled={!formData.venueId}
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select a court</option>
                  {availableCourts.map((court) => (
                    <option key={court.id} value={court.id} className="bg-gray-800">
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match Date *
                </label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
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

            {formData.accessType === 'reserve' && (
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
            )}
          </div>

          {/* Match Format & Participants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Format & Participants
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Match Format
                </label>
                <div className="w-full h-9 px-3 py-1 rounded-md bg-gray-800/50 border border-gray-600 text-gray-300 flex items-center">
                  {getFormatDisplayName(formData.format)}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Automatically set based on sport and match type
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Players
                </label>
                <Input
                  type="number"
                  value={formData.maxPlayers}
                  readOnly
                  className="bg-gray-800/50 border-gray-600 text-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Automatically set based on match type
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Prizes
            </h3>
            
            {formData.accessType === 'reserve' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            ) : (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-sm">
                  <strong>Open Match:</strong> This is a walk-in match. Players pay court fees directly at the venue. No advance booking or entry fees required.
                </p>
              </div>
            )}
          </div>

          {/* Rules and Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rules & Requirements
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Match Rules
              </label>
              <Textarea
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Specify scoring system, time limits, dress code, and any special match rules..."
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
              disabled={uploadingImage}
              className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: '#456882',
                boxShadow: '0 4px 12px rgba(69, 104, 130, 0.3)'
              }}
            >
              {uploadingImage ? 'Uploading Image...' : (editingMatch ? 'Update Match' : 'Create Match')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}