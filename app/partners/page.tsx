"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"

export default function PartnersPage() {
  const stats = [
    { number: "1M+", label: "Player Reservations" },
    { number: "500+", label: "Partner Courts" },
    { number: "50K+", label: "Active Players" },
    { number: "100+", label: "Cities" },
  ]

  const partnershipTypes = [
    {
      title: "Sponsorships",
      description: "Align your brand with the fastest-growing sports community. Reach engaged players through our platform and events.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      title: "Events",
      description: "Host tournaments and community events. Connect with players through organized competitions and social gatherings.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Digital Campaigns",
      description: "Leverage our digital platform to reach thousands of active players with targeted campaigns and promotions.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  const trustedPartners = [
    { name: "Wilson" },
    { name: "Head" },
    { name: "Babolat" },
    { name: "Dunlop" },
    { name: "Prince" },
    { name: "Yonex" },
    { name: "Nox" },
    { name: "Bullpadel" },
  ]

  return (
    <div className="min-h-screen overscroll-none overflow-x-hidden" style={{ background: '#050a0f' }}>
      <Header />

      <main className="overscroll-none overflow-x-hidden relative">
        {/* Hero Section with Background Image */}
        <section className="relative min-h-[60vh] flex items-center">
          {/* Background image */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/Backgrounddark1.png')",
            }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut"
            }}
          />
          
          {/* Background gradient overlay */}
          <motion.div 
            className="absolute inset-0" 
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(5, 10, 15, 0.8) 70%, rgba(5, 10, 15, 1) 100%)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.6,
              delay: 0.2,
              ease: "easeOut"
            }}
          />

          {/* Decorative background elements */}
          <motion.div
            className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
            style={{ background: '#456882' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 0.05,
              scale: 1,
              x: [0, -30, 0, 30, 0],
              y: [0, 40, 0, -40, 0]
            }}
            transition={{
              opacity: { duration: 1.5, delay: 0.8 },
              scale: { duration: 1.5, delay: 0.8 },
              x: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2.3 },
              y: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2.3 }
            }}
          />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 sm:py-20 md:py-24 lg:py-28 xl:py-32">
            {/* Header Section */}
            <motion.div 
              className="text-center max-w-4xl xl:max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Partner with{" "}
                <motion.span 
                  style={{ 
                    color: '#456882',
                    display: 'inline-block',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    transform: 'translate3d(0,0,0)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    x: [0, 2, 3, 2, 0, -2, -3, -2, 0],
                    y: [0, -2, 0, 2, 3, 2, 0, -2, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.8, delay: 0.8 },
                    x: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 },
                    y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }
                  }}
                >
                  PlayCircle
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Join us in building the world's largest sports community
              </motion.p>
            </motion.div>
          </div>

          {/* Animated Scroll Indicator */}
          <motion.div 
            className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center relative"
              whileHover={{ borderColor: 'rgba(69, 104, 130, 0.8)' }}
            >
              <motion.div
                className="w-1 h-3 rounded-full mt-2"
                style={{ backgroundColor: '#456882' }}
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0.3, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <motion.div
              className="mt-2"
              animate={{ 
                y: [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg 
                className="w-4 h-4 text-white/60" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* Content Section */}
        <section className="relative" style={{ background: '#050a0f' }}>

          {/* Stats Section */}
          <section className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <motion.div
              className="absolute top-1/3 left-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
              style={{ background: '#456882' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.05,
                scale: 1,
                x: [0, 50, 0, -50, 0],
                y: [0, -30, 0, 30, 0]
              }}
              transition={{
                opacity: { duration: 1.5, delay: 1.5 },
                scale: { duration: 1.5, delay: 1.5 },
                x: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 },
                y: { duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }
              }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div 
                className="text-center mb-12 sm:mb-16 lg:mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  By the Numbers
                </motion.h2>
                <motion.div 
                  className="w-12 sm:w-16 h-px mx-auto" 
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.12) 0%, rgba(13, 18, 22, 0.8) 100%)',
                      border: '1px solid rgba(69, 104, 130, 0.25)',
                      boxShadow: '0 0 30px rgba(69, 104, 130, 0.08)'
                    }}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: '0 0 50px rgba(69, 104, 130, 0.15)'
                    }}
                  >
                    <motion.div 
                      className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 leading-tight" 
                      style={{ color: '#456882' }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    >
                      {stat.number}
                    </motion.div>
                    <motion.div 
                      className="text-xs sm:text-sm lg:text-base text-gray-300"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                    >
                      {stat.label}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Partnership Opportunities */}
          <section className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <motion.div
              className="absolute top-1/4 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl"
              style={{ background: '#456882' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.05,
                scale: 1,
                x: [0, -30, 0, 30, 0],
                y: [0, 40, 0, -40, 0]
              }}
              transition={{
                opacity: { duration: 1.5, delay: 2 },
                scale: { duration: 1.5, delay: 2 },
                x: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3.5 },
                y: { duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3.5 }
              }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div 
                className="text-center mb-12 sm:mb-16 lg:mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Partnership Opportunities
                </motion.h2>
                <motion.div 
                  className="w-12 sm:w-16 h-px mx-auto" 
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {partnershipTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    className="text-center rounded-3xl p-6 sm:p-8 backdrop-blur-md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.12) 0%, rgba(13, 18, 22, 0.8) 100%)',
                      border: '1px solid rgba(69, 104, 130, 0.25)',
                      boxShadow: '0 0 30px rgba(69, 104, 130, 0.08)'
                    }}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      boxShadow: '0 0 50px rgba(69, 104, 130, 0.15)'
                    }}
                  >
                    <motion.div
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(69, 104, 130, 0.2)', color: '#456882' }}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1 + 0.3,
                        ease: "easeOut"
                      }}
                      whileHover={{ rotate: 360 }}
                    >
                      {type.icon}
                    </motion.div>
                    <motion.h3 
                      className="text-xl sm:text-2xl font-semibold text-white mb-3 sm:mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                    >
                      {type.title}
                    </motion.h3>
                    <motion.p 
                      className="text-sm sm:text-base text-gray-400 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                    >
                      {type.description}
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 blur-3xl"
              style={{ background: '#456882' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 0.05,
                scale: 1,
                x: [0, -40, 0, 40, 0],
                y: [0, 30, 0, -30, 0]
              }}
              transition={{
                opacity: { duration: 1.5, delay: 2.2 },
                scale: { duration: 1.5, delay: 2.2 },
                x: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3.7 },
                y: { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3.7 }
              }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-12 sm:mb-16 lg:mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Simple, Transparent Pricing
                </motion.h2>
                <motion.div
                  className="w-12 sm:w-16 h-px mx-auto mb-6"
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
                <motion.p
                  className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Get approved first, pay only when you're ready to go live
                </motion.p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12">
                {/* Monthly Plan */}
                <motion.div
                  className="rounded-3xl p-8 sm:p-10 backdrop-blur-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.12) 0%, rgba(13, 18, 22, 0.8) 100%)',
                    border: '1px solid rgba(69, 104, 130, 0.25)',
                    boxShadow: '0 0 30px rgba(69, 104, 130, 0.08)'
                  }}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    boxShadow: '0 0 50px rgba(69, 104, 130, 0.15)'
                  }}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Monthly</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-white">$99</span>
                      <span className="text-lg text-gray-400">/month</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Flexible month-to-month billing</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Cancel anytime</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Full platform access</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Venue & court management</span>
                    </li>
                  </ul>
                </motion.div>

                {/* Yearly Plan */}
                <motion.div
                  className="rounded-3xl p-8 sm:p-10 backdrop-blur-md relative"
                  style={{
                    background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.18) 0%, rgba(13, 18, 22, 0.85) 100%)',
                    border: '2px solid rgba(69, 104, 130, 0.4)',
                    boxShadow: '0 0 40px rgba(69, 104, 130, 0.12)'
                  }}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{
                    scale: 1.02,
                    y: -5,
                    boxShadow: '0 0 60px rgba(69, 104, 130, 0.2)'
                  }}
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#456882' }}>
                      Save 25%
                    </span>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">Yearly</h3>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-white">$899</span>
                      <span className="text-lg text-gray-400">/year</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">$74.00/month billed annually</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save $300 per year</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Everything in Monthly</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-300">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#456882' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Advanced analytics</span>
                    </li>
                  </ul>
                </motion.div>
              </div>

              {/* CTA Box */}
              <motion.div
                className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-10 backdrop-blur-md text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.15) 0%, rgba(13, 18, 22, 0.8) 100%)',
                  border: '1px solid rgba(69, 104, 130, 0.3)',
                  boxShadow: '0 0 40px rgba(69, 104, 130, 0.1)'
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(69, 104, 130, 0.2)', color: '#456882' }}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ rotate: 360 }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Apply First, Pay After Approval
                </h3>
                <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed">
                  Your payment only starts once your partnership application is approved and you're ready to launch.
                  Apply now with no upfront costs or commitments.
                </p>
                <motion.a
                  href="#apply"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#apply')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center px-8 py-4 rounded-full text-lg font-semibold text-white"
                  style={{ backgroundColor: '#456882' }}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    boxShadow: '0 10px 30px rgba(69, 104, 130, 0.3)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  Apply for Partnership
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.a>
              </motion.div>
            </div>
          </section>

          {/* Existing Partners Section */}
          <section className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <div className="max-w-4xl mx-auto relative z-10">
              <motion.div
                className="text-center mb-12 sm:mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Existing Partners
                </motion.h2>
                <motion.div 
                  className="w-12 sm:w-16 h-px mx-auto mb-6" 
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
                <motion.p 
                  className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Already a PlayCircle partner? Access your dashboard to manage venues, courts, matches, and events.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <motion.a
                    href="/partner/entry"
                    className="inline-flex items-center px-8 py-4 rounded-full text-lg font-semibold text-white"
                    style={{ backgroundColor: '#456882' }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: '0 10px 30px rgba(69, 104, 130, 0.3)'
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Partner Dashboard
                  </motion.a>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Partnership Application Form */}
          <section id="apply" className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <div className="max-w-4xl mx-auto relative z-10">
              <motion.div 
                className="text-center mb-12 sm:mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Apply for Partnership
                </motion.h2>
                <motion.div 
                  className="w-12 sm:w-16 h-px mx-auto mb-6" 
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
                <motion.p 
                  className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Tell us about your company and how you'd like to partner with PlayCircle
                </motion.p>
              </motion.div>

              <motion.div
                className="rounded-3xl p-8 sm:p-12 backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.15) 0%, rgba(13, 18, 22, 0.8) 100%)',
                  border: '1px solid rgba(69, 104, 130, 0.3)',
                  boxShadow: '0 0 40px rgba(69, 104, 130, 0.1)'
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors"
                        placeholder="Your company name"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Industry *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors"
                      >
                        <option value="">Select industry</option>
                        <option value="sports-equipment">Sports Equipment</option>
                        <option value="sports-facilities">Sports Facilities</option>
                        <option value="technology">Technology</option>
                        <option value="media">Media & Entertainment</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </motion.div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors"
                        placeholder="Your full name"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    >
                      <label className="block text-sm font-medium text-white mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors"
                        placeholder="your@company.com"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Partnership Type *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors"
                    >
                      <option value="">Select partnership type</option>
                      <option value="sponsorship">Sponsorship</option>
                      <option value="events">Events & Tournaments</option>
                      <option value="digital-campaigns">Digital Campaigns</option>
                      <option value="facility-partnership">Facility Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.5 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Company Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors resize-none"
                      placeholder="Tell us about your company, products/services, and target audience..."
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <label className="block text-sm font-medium text-white mb-2">
                      Partnership Goals *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-gray-600 text-white placeholder-gray-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors resize-none"
                      placeholder="What are your goals for this partnership? How do you envision working together?"
                    />
                  </motion.div>

                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  >
                    <motion.button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold text-white"
                      style={{ backgroundColor: '#456882' }}
                      whileHover={{ 
                        scale: 1.05, 
                        y: -2,
                        boxShadow: '0 10px 30px rgba(69, 104, 130, 0.3)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      Submit Partnership Application
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </div>
          </section>

          {/* Trusted Partners */}
          <section className="py-16 sm:py-24 lg:py-32 px-4 relative overflow-hidden" style={{ background: '#050a0f' }}>
            <motion.div
              className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl"
              style={{ background: '#456882' }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 0.05,
                scale: 1,
                x: [0, 50, 0, -50, 0],
                y: [0, -30, 0, 30, 0]
              }}
              transition={{
                opacity: { duration: 1.5, delay: 2.5 },
                scale: { duration: 1.5, delay: 2.5 },
                x: { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 },
                y: { duration: 22, repeat: Infinity, ease: "easeInOut", delay: 4 }
              }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
              <motion.div 
                className="text-center mb-12 sm:mb-16 lg:mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Trusted by Leading Brands
                </motion.h2>
                <motion.div 
                  className="w-12 sm:w-16 h-px mx-auto" 
                  style={{ backgroundColor: '#456882' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: 'auto' }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {trustedPartners.map((partner, index) => (
                  <motion.div
                    key={index}
                    className="text-center rounded-2xl p-6 sm:p-8 backdrop-blur-md"
                    style={{
                      background: 'linear-gradient(135deg, rgba(69, 104, 130, 0.1) 0%, rgba(13, 18, 22, 0.7) 100%)',
                      border: '1px solid rgba(69, 104, 130, 0.2)',
                      boxShadow: '0 0 20px rgba(69, 104, 130, 0.05)'
                    }}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -5,
                      boxShadow: '0 0 40px rgba(69, 104, 130, 0.1)'
                    }}
                  >
                    <div className="h-16 sm:h-20 flex items-center justify-center">
                      <motion.h3 
                        className="text-base sm:text-lg lg:text-xl font-semibold text-white"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                      >
                        {partner.name}
                      </motion.h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}
