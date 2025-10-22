"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SupportHelpType = 'partnership' | 'general_inquiry' | 'feedback' | 'other'

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [helpType, setHelpType] = useState<SupportHelpType | "">("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "")

    // Format as 305-555-1234
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: phoneNumber,
      helpType: helpType as SupportHelpType,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Thank you! We\'ll get back to you soon.'
        })
        // Reset form
        formRef.current?.reset()
        setPhoneNumber('')
        setHelpType('')
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Something went wrong. Please try again.'
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {/* Glass Card */}
      <div
        className="rounded-2xl p-8 lg:p-10 backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.15) 0%, rgba(13, 18, 22, 0.9) 100%)',
          border: '1px solid rgba(69, 104, 130, 0.3)',
          boxShadow: '0 0 40px rgba(69, 104, 130, 0.15)'
        }}
      >
        {/* Status Messages */}
        {submitStatus.type && (
          <div
            className={`mb-5 p-4 rounded-lg ${
              submitStatus.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {/* Name Row */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300 text-sm font-medium">
                First name <span style={{ color: '#456882' }}>*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="John"
                className="bg-[#0a0f14]/80 border-[#456882]/30 text-white placeholder:text-gray-500 rounded-lg h-12 text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300 text-sm font-medium">
                Last name <span style={{ color: '#456882' }}>*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Doe"
                className="bg-[#0a0f14]/80 border-[#456882]/30 text-white placeholder:text-gray-500 rounded-lg h-12 text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
              />
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium">
                Email <span style={{ color: '#456882' }}>*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="john@example.com"
                className="bg-[#0a0f14]/80 border-[#456882]/30 text-white placeholder:text-gray-500 rounded-lg h-12 text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300 text-sm font-medium">
                Phone <span style={{ color: '#456882' }}>*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="305-555-1234"
                maxLength={12}
                className="bg-[#0a0f14]/80 border-[#456882]/30 text-white placeholder:text-gray-500 rounded-lg h-12 text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
              />
            </div>
          </div>

          {/* How can we help? */}
          <div className="space-y-2">
            <Label htmlFor="helpType" className="text-gray-300 text-sm font-medium">
              How can we help? <span style={{ color: '#456882' }}>*</span>
            </Label>
            <Select required value={helpType} onValueChange={(value) => setHelpType(value as SupportHelpType)}>
              <SelectTrigger
                id="helpType"
                className="bg-[#0a0f14]/80 border-[#456882]/30 text-white rounded-lg h-12 text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
              >
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1219] border-[#456882]/30 text-white">
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Your message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300 text-sm font-medium">
              Your message <span style={{ color: '#456882' }}>*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Tell us more about your inquiry..."
              className="bg-[#0a0f14]/80 border-[#456882]/30 text-white placeholder:text-gray-500 rounded-lg text-base focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 font-semibold rounded-lg text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: '#456882',
              color: 'white'
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  )
}

