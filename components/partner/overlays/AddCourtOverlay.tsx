'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, DollarSign, X } from 'lucide-react'
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

interface AddCourtOverlayProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (courtData: any) => void
  venues?: Array<{ id: string; name: string }>
  editingCourt?: any
}

export function AddCourtOverlay({ isOpen, onClose, onSubmit, venues = [], editingCourt }: AddCourtOverlayProps) {
  const [formData, setFormData] = useState({
    name: '',
    venueId: '',
    sport: 'tennis',
    surface: 'hard',
    indoor: false,
    lighting: false,
    netProvided: true,
    equipmentRental: false,
    description: '',
    hourlyRate: '',
    peakHourRate: '',
    advanceBookingDays: '30',
    maxBookingDuration: '180',
    length: '',
    width: '',
    height: '',
    availability: {
      monday: { available: true, openTime: '06:00', closeTime: '22:00' },
      tuesday: { available: true, openTime: '06:00', closeTime: '22:00' },
      wednesday: { available: true, openTime: '06:00', closeTime: '22:00' },
      thursday: { available: true, openTime: '06:00', closeTime: '22:00' },
      friday: { available: true, openTime: '06:00', closeTime: '22:00' },
      saturday: { available: true, openTime: '08:00', closeTime: '20:00' },
      sunday: { available: true, openTime: '08:00', closeTime: '20:00' },
    }
  })

  // Populate form when editing or reset when creating new court
  useEffect(() => {
    if (editingCourt) {
      // Convert availability from database format to form format
      const availability: any = {
        monday: { available: true, openTime: '06:00', closeTime: '22:00' },
        tuesday: { available: true, openTime: '06:00', closeTime: '22:00' },
        wednesday: { available: true, openTime: '06:00', closeTime: '22:00' },
        thursday: { available: true, openTime: '06:00', closeTime: '22:00' },
        friday: { available: true, openTime: '06:00', closeTime: '22:00' },
        saturday: { available: true, openTime: '08:00', closeTime: '20:00' },
        sunday: { available: true, openTime: '08:00', closeTime: '20:00' },
      }

      // If court has available_hours, convert them to form format
      if (editingCourt.available_hours) {
        Object.keys(availability).forEach(day => {
          if (editingCourt.available_hours[day] && editingCourt.available_hours[day].length > 0) {
            availability[day] = {
              available: true,
              openTime: editingCourt.available_hours[day][0].start,
              closeTime: editingCourt.available_hours[day][0].end,
            }
          } else {
            availability[day] = { available: false, openTime: '06:00', closeTime: '22:00' }
          }
        })
      }

      setFormData({
        name: editingCourt.name || '',
        venueId: editingCourt.venue_id || '',
        sport: editingCourt.sport_type || 'tennis',
        surface: editingCourt.surface_type || 'hard',
        indoor: editingCourt.indoor || false,
        lighting: editingCourt.lighting || false,
        netProvided: editingCourt.net_provided || true,
        equipmentRental: editingCourt.equipment_rental || false,
        description: editingCourt.description || '',
        hourlyRate: editingCourt.hourly_rate?.toString() || '',
        peakHourRate: editingCourt.peak_rate?.toString() || '',
        advanceBookingDays: editingCourt.advance_booking_days?.toString() || '30',
        maxBookingDuration: editingCourt.max_booking_duration?.toString() || '180',
        length: editingCourt.length_meters?.toString() || '',
        width: editingCourt.width_meters?.toString() || '',
        height: editingCourt.height_meters?.toString() || '',
        availability: availability,
      })
    } else {
      // Reset form for new court creation
      setFormData({
        name: '',
        venueId: '',
        sport: 'tennis',
        surface: 'hard',
        indoor: false,
        lighting: false,
        netProvided: true,
        equipmentRental: false,
        description: '',
        hourlyRate: '',
        peakHourRate: '',
        advanceBookingDays: '30',
        maxBookingDuration: '180',
        length: '',
        width: '',
        height: '',
        availability: {
          monday: { available: true, openTime: '06:00', closeTime: '22:00' },
          tuesday: { available: true, openTime: '06:00', closeTime: '22:00' },
          wednesday: { available: true, openTime: '06:00', closeTime: '22:00' },
          thursday: { available: true, openTime: '06:00', closeTime: '22:00' },
          friday: { available: true, openTime: '06:00', closeTime: '22:00' },
          saturday: { available: true, openTime: '08:00', closeTime: '20:00' },
          sunday: { available: true, openTime: '08:00', closeTime: '20:00' },
        },
      })
    }
  }, [editingCourt])

  const sportOptions = [
    { value: 'tennis', label: 'Tennis' },
    { value: 'padel', label: 'Padel' },
    { value: 'pickleball', label: 'Pickleball' },
    { value: 'badminton', label: 'Badminton' },
    { value: 'squash', label: 'Squash' },
    { value: 'racquetball', label: 'Racquetball' },
    { value: 'table_tennis', label: 'Table Tennis' },
  ]

  const surfaceOptions = [
    { value: 'hard', label: 'Hard Court' },
    { value: 'clay', label: 'Clay Court' },
    { value: 'grass', label: 'Grass Court' },
    { value: 'indoor_hard', label: 'Indoor Hard Court' },
    { value: 'synthetic', label: 'Synthetic' },
    { value: 'wood', label: 'Wood' },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day as keyof typeof prev.availability],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = editingCourt
      ? { ...formData, courtId: editingCourt.id }
      : formData
    onSubmit(submitData)
    // Don't close or reset here - let the parent handle it after the async operation completes
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ]

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
              <MapPin className="h-6 w-6" style={{ color: '#456882' }} />
            </div>
            {editingCourt ? 'Edit Court' : 'Add New Court'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editingCourt ? 'Update court information and settings' : 'Add a new court to your venue for bookings and matches'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Court Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Court 1, Center Court, etc."
                  required
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  Surface Type *
                </label>
                <select
                  value={formData.surface}
                  onChange={(e) => handleInputChange('surface', e.target.value)}
                  required
                  className="w-full h-9 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {surfaceOptions.map((surface) => (
                    <option key={surface.value} value={surface.value} className="bg-gray-800">
                      {surface.label}
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
                placeholder="Describe the court features, condition, and any special notes..."
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Court Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Court Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="indoor"
                  checked={formData.indoor}
                  onChange={(e) => handleInputChange('indoor', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="indoor" className="text-sm font-medium text-gray-300">
                  Indoor Court
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="lighting"
                  checked={formData.lighting}
                  onChange={(e) => handleInputChange('lighting', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="lighting" className="text-sm font-medium text-gray-300">
                  Lighting Available
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="netProvided"
                  checked={formData.netProvided}
                  onChange={(e) => handleInputChange('netProvided', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="netProvided" className="text-sm font-medium text-gray-300">
                  Net Provided
                </label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="equipmentRental"
                  checked={formData.equipmentRental}
                  onChange={(e) => handleInputChange('equipmentRental', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="equipmentRental" className="text-sm font-medium text-gray-300">
                  Equipment Rental Available
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </h3>
            <p className="text-sm text-gray-400">Set hourly rates for the entire court (not per player)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Regular Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Price for the full court per hour</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Peak Hour Rate ($)
                </label>
                <Input
                  type="number"
                  value={formData.peakHourRate}
                  onChange={(e) => handleInputChange('peakHourRate', e.target.value)}
                  placeholder="35.00"
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Higher rate during busy hours</p>
              </div>
            </div>
          </div>

          {/* Court Dimensions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Court Dimensions</h3>
            <p className="text-sm text-gray-400">Optional - specify court size in meters</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Length (meters)
                </label>
                <Input
                  type="number"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  placeholder=""
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width (meters)
                </label>
                <Input
                  type="number"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  placeholder=""
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Net Height (meters)
                </label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder=""
                  min="0"
                  step="0.01"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Availability Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Schedule
            </h3>
            
            <div className="space-y-3">
              {daysOfWeek.map((day) => (
                <div key={day.key} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3 min-w-[120px]">
                    <input
                      type="checkbox"
                      id={`${day.key}-available`}
                      checked={formData.availability[day.key as keyof typeof formData.availability].available}
                      onChange={(e) => handleAvailabilityChange(day.key, 'available', e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor={`${day.key}-available`} className="text-sm font-medium text-gray-300">
                      {day.label}
                    </label>
                  </div>
                  
                  {formData.availability[day.key as keyof typeof formData.availability].available && (
                    <div className="flex items-center space-x-3 flex-1">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Open</label>
                        <input
                          type="time"
                          value={formData.availability[day.key as keyof typeof formData.availability].openTime}
                          onChange={(e) => handleAvailabilityChange(day.key, 'openTime', e.target.value)}
                          className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <span className="text-gray-400">to</span>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Close</label>
                        <input
                          type="time"
                          value={formData.availability[day.key as keyof typeof formData.availability].closeTime}
                          onChange={(e) => handleAvailabilityChange(day.key, 'closeTime', e.target.value)}
                          className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Booking Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Booking Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Advance Booking Days
                </label>
                <Input
                  type="number"
                  value={formData.advanceBookingDays}
                  onChange={(e) => handleInputChange('advanceBookingDays', e.target.value)}
                  placeholder="30"
                  min="1"
                  max="365"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">How many days in advance can users book this court</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Booking Duration (minutes)
                </label>
                <Input
                  type="number"
                  value={formData.maxBookingDuration}
                  onChange={(e) => handleInputChange('maxBookingDuration', e.target.value)}
                  placeholder="180"
                  min="30"
                  step="30"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum time one user can book in a row</p>
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
              className="text-white"
              style={{
                background: '#456882',
                boxShadow: '0 4px 12px rgba(69, 104, 130, 0.3)'
              }}
            >
              {editingCourt ? 'Save Changes' : 'Create Court'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}