'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Calendar, Clock, DollarSign, GraduationCap, X } from 'lucide-react'
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

interface CreateClassOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (classData: any) => void
  venues?: Array<{ id: string; name: string; address?: string; city?: string; state?: string; postal_code?: string }>
  courts?: Array<{ id: string; name: string; venueId: string }>
  editingClass?: any
}

export function CreateClassOverlay({ 
  isOpen, 
  onClose, 
  onSubmit, 
  venues = [], 
  courts = [],
  editingClass = null
}: CreateClassOverlayProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classType: 'clinic',
    sport: 'tennis',
    accessType: 'reserve',
    venueId: '',
    courtId: '',
    location: '',
    instructorName: '',
    instructorBio: '',
    skillLevel: 'beginner',
    ageGroup: 'adult',
    maxStudents: '',
    duration: '60',
    price: '',
    packagePrice: '',
    packageSessions: '4',
    registrationDeadline: '',
    schedule: {
      recurring: true,
      frequency: 'weekly',
      dayOfWeek: 'monday',
      startTime: '',
      endTime: '',
      startDate: '',
      endDate: '',
    },
    equipment: 'provided',
    requirements: [] as string[],
    objectives: '',
    curriculum: '',
  })

  // Update form data when editing class changes
  React.useEffect(() => {
    if (editingClass) {
      setFormData(editingClass)
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        description: '',
        classType: 'clinic',
        sport: 'tennis',
        accessType: 'reserve',
        venueId: '',
        courtId: '',
        location: '',
        instructorName: '',
        instructorBio: '',
        skillLevel: 'beginner',
        ageGroup: 'adults',
        maxStudents: '',
        duration: '60',
        price: '',
        packagePrice: '',
        packageSessions: '4',
        registrationDeadline: '',
        schedule: {
          recurring: true,
          frequency: 'weekly',
          dayOfWeek: 'monday',
          startTime: '',
          endTime: '',
          startDate: '',
          endDate: '',
        },
        equipment: 'provided',
        requirements: [] as string[],
        objectives: '',
        curriculum: '',
      })
    }
  }, [editingClass])

  const classTypes = [
    { value: 'clinic', label: 'Clinic' },
    { value: 'camp', label: 'Camp' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'class', label: 'Class' },
  ]

  const sportOptions = [
    { value: 'tennis', label: 'Tennis' },
    { value: 'pickleball', label: 'Pickleball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'squash', label: 'Squash' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
  ]

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'all_levels', label: 'All Levels' },
  ]

  const ageGroups = [
    { value: 'kids', label: 'Kids (6-12)' },
    { value: 'teens', label: 'Teens (13-17)' },
    { value: 'adults', label: 'Adult (18+)' },
    { value: 'seniors', label: 'Senior (55+)' },
    { value: 'all_ages', label: 'All Ages' },
  ]

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'one-time', label: 'One-time' },
  ]

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ]

  const accessTypes = [
    { value: 'reserve', label: 'Reserve (Mobile App Booking)' },
    { value: 'open', label: 'Open (Walk-in)' },
  ]

  const equipmentOptions = [
    { value: 'provided', label: 'Equipment Provided' },
    { value: 'bring-own', label: 'Bring Your Own' },
    { value: 'rental-available', label: 'Rental Available' },
  ]

  const requirementOptions = [
    'No Experience Required',
    'Basic Skills Required',
    'Waiver Must Be Signed',
    'Parent/Guardian Consent (Minors)',
    'Medical Clearance Required',
    'Proper Athletic Attire Required',
    'Non-marking Shoes Required',
    'Advance Registration Required'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleScheduleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value
      }
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

  // Auto-populate location when venue is selected
  const handleVenueChange = (venueId: string) => {
    const selectedVenue = venues.find(venue => venue.id === venueId)
    let fullAddress = ''
    
    if (selectedVenue) {
      // Build full address from venue data
      const addressParts = []
      if (selectedVenue.address) addressParts.push(selectedVenue.address)
      if (selectedVenue.city) addressParts.push(selectedVenue.city)
      if (selectedVenue.state) addressParts.push(selectedVenue.state)
      if (selectedVenue.postal_code) addressParts.push(selectedVenue.postal_code)
      
      fullAddress = addressParts.join(', ')
    }
    
    setFormData(prev => ({
      ...prev,
      venueId,
      courtId: '', // Reset court selection when venue changes
      location: fullAddress
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    // Reset form
    setFormData({
      title: '',
      description: '',
      classType: 'clinic',
      sport: 'tennis',
      accessType: 'reserve',
      venueId: '',
      courtId: '',
      location: '',
      instructorName: '',
      instructorBio: '',
      skillLevel: 'beginner',
      ageGroup: 'adult',
      maxStudents: '',
      duration: '60',
      price: '',
      packagePrice: '',
      packageSessions: '4',
      registrationDeadline: '',
      schedule: {
        recurring: true,
        frequency: 'weekly',
        dayOfWeek: 'monday',
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: '',
      },
      equipment: 'provided',
      requirements: [],
      objectives: '',
      curriculum: '',
    })
  }

  const availableCourts = courts.filter(court => 
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
              <GraduationCap className="h-6 w-6" style={{ color: '#456882' }} />
            </div>
            {editingClass ? 'Edit Class' : 'Create New Class'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingClass ? 'Update your class details and schedule' : 'Create a new class or lesson program at your venue'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Class Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Class Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Beginner Tennis Lessons"
                required
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Class Type *
                </label>
                <select
                  value={formData.classType}
                  onChange={(e) => handleInputChange('classType', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {classTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    ? 'Students book and pay through the mobile app' 
                    : 'Walk-in class - no advance booking required'
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (minutes) *
                </label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="60"
                  min="15"
                  step="15"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Group *
                </label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ageGroups.map((group) => (
                    <option key={group.value} value={group.value} className="bg-gray-800">
                      {group.label}
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
                placeholder="Describe what students will learn, the teaching approach, and what makes this class special..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Location</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue *
                </label>
                <select
                  value={formData.venueId}
                  onChange={(e) => handleVenueChange(e.target.value)}
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
                  Court
                </label>
                <select
                  value={formData.courtId}
                  onChange={(e) => handleInputChange('courtId', e.target.value)}
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.venueId}
                >
                  <option value="">Any available court</option>
                  {availableCourts.map((court) => (
                    <option key={court.id} value={court.id} className="bg-gray-800">
                      {court.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location Details
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Full address (auto-filled from venue)"
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will be auto-filled with the venue's full address. You can modify or add additional details if needed.
              </p>
            </div>
          </div>

          {/* Instructor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Instructor</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instructor Name *
              </label>
              <Input
                value={formData.instructorName}
                onChange={(e) => handleInputChange('instructorName', e.target.value)}
                placeholder="John Smith"
                required
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instructor Bio
              </label>
              <Textarea
                value={formData.instructorBio}
                onChange={(e) => handleInputChange('instructorBio', e.target.value)}
                placeholder="Instructor's experience, certifications, and teaching philosophy..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.schedule.recurring}
                onChange={(e) => handleScheduleChange('recurring', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-300">
                Recurring Class
              </label>
            </div>

            {formData.schedule.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.schedule.frequency}
                    onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq.value} value={freq.value} className="bg-gray-800">
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={formData.schedule.dayOfWeek}
                    onChange={(e) => handleScheduleChange('dayOfWeek', e.target.value)}
                    className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day.value} value={day.value} className="bg-gray-800">
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={(e) => handleScheduleChange('startTime', e.target.value)}
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
                  value={formData.schedule.endTime}
                  onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.schedule.startDate}
                  onChange={(e) => handleScheduleChange('startDate', e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={formData.schedule.endDate}
                  onChange={(e) => handleScheduleChange('endDate', e.target.value)}
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
                <p className="text-xs text-gray-400 mt-1">
                  Last date students can register for this class (only for mobile app booking)
                </p>
              </div>
            )}
          </div>

          {/* Capacity and Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity & Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Students
                </label>
                <Input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                  placeholder="8"
                  min="1"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipment
                </label>
                <select
                  value={formData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {equipmentOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.accessType === 'reserve' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing (Mobile App Booking)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price per Session ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="25.00"
                      min="0"
                      step="0.01"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Package Price ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.packagePrice}
                      onChange={(e) => handleInputChange('packagePrice', e.target.value)}
                      placeholder="90.00"
                      min="0"
                      step="0.01"
                      className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sessions in Package
                  </label>
                  <Input
                    type="number"
                    value={formData.packageSessions}
                    onChange={(e) => handleInputChange('packageSessions', e.target.value)}
                    placeholder="4"
                    min="1"
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {formData.accessType === 'open' && (
              <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
                <p className="text-blue-400 text-sm">
                  <strong>Walk-in Class:</strong> No advance booking required. Students can join directly at the venue. 
                  Payment will be handled at the venue.
                </p>
              </div>
            )}
          </div>

          {/* Learning Objectives and Curriculum */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Learning Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Objectives
              </label>
              <Textarea
                value={formData.objectives}
                onChange={(e) => handleInputChange('objectives', e.target.value)}
                placeholder="What will students learn and achieve by the end of this class?"
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Curriculum Overview
              </label>
              <Textarea
                value={formData.curriculum}
                onChange={(e) => handleInputChange('curriculum', e.target.value)}
                placeholder="Outline the topics and skills covered in each session..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Requirements</h3>
            
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
              className="text-white"
              style={{
                background: '#456882',
                boxShadow: '0 4px 12px rgba(69, 104, 130, 0.3)'
              }}
            >
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}