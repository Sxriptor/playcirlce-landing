"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const pathname = usePathname()

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Function to get link styles based on active state
  const getLinkStyles = (href: string, isDesktop = true) => {
    const baseStyles = {
      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)',
      fontWeight: 500
    }

    if (isActive(href)) {
      return {
        ...baseStyles,
        color: '#456882',
        textShadow: '0 0 10px rgba(69, 104, 130, 0.8), 0 0 20px rgba(69, 104, 130, 0.6), 0 0 30px rgba(69, 104, 130, 0.4), 1px 1px 3px rgba(0, 0, 0, 0.8)',
        fontWeight: 600
      }
    }

    return baseStyles
  }


  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 w-full z-50"
      >
        <div className="w-full safe-area-inset px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-6 lg:gap-8 flex-1 min-w-0">
            <a href="/" className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 whitespace-nowrap flex-shrink-0">
              <motion.div
                className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ${mobileMenuOpen ? 'blur-sm' : ''}`}
                style={{
                  filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.9))'
                }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                  stiffness: 200,
                  delay: 0.1
                }}
              >
                <img
                  src="/playcirclelogonew.png"
                  alt="PlayCircle Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <motion.span
                className={`text-base xs:text-lg sm:text-xl md:text-2xl text-white font-bold transition-all duration-300 ${mobileMenuOpen ? 'blur-sm' : ''
                  }`}
                style={{
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 1px 1px 2px rgba(0, 0, 0, 0.9), 0 0 8px rgba(255, 255, 255, 0.2)'
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.3
                }}
              >
                PlayCircle
              </motion.span>
            </a>
            <motion.nav
              className="hidden md:flex items-center gap-1 lg:gap-2 p-1.5 lg:p-2 rounded-full flex-shrink-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.5
              }}
            >
              <a
                href="/"
                className={`text-xs lg:text-sm transition-all duration-200 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/') ? '' : 'text-white/80 hover:text-white'
                }`}
                style={getLinkStyles('/')}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Home
              </a>
              <a
                href="/about"
                className={`text-xs lg:text-sm transition-all duration-200 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/about') ? '' : 'text-white/80 hover:text-white'
                }`}
                style={getLinkStyles('/about')}
                onMouseEnter={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                About
              </a>
              <a
                href="/contact"
                className={`text-xs lg:text-sm transition-all duration-200 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/contact') ? '' : 'text-white/80 hover:text-white'
                }`}
                style={getLinkStyles('/contact')}
                onMouseEnter={(e) => {
                  if (!isActive('/contact')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/contact')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Contact
              </a>
              <a
                href="/meet-playcircle"
                className={`text-xs lg:text-sm transition-all duration-200 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/meet-playcircle') ? '' : 'text-white/80 hover:text-white'
                }`}
                style={getLinkStyles('/meet-playcircle')}
                onMouseEnter={(e) => {
                  if (!isActive('/meet-playcircle')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/meet-playcircle')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Meet PlayCircle
              </a>
              <a
                href="/partners"
                className={`text-xs lg:text-sm transition-all duration-200 px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-full whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/partners') ? '' : 'text-white/80 hover:text-white'
                }`}
                style={getLinkStyles('/partners')}
                onMouseEnter={(e) => {
                  if (!isActive('/partners')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/partners')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Partners
              </a>
            </motion.nav>
          </div>

          {/* Desktop: App Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.7,
              type: "spring"
            }}
          >
            <Button
              onClick={() => {
                if (pathname === '/partners') {
                  window.location.href = '/partner/entry'
                } else {
                  setDownloadDialogOpen(true)
                }
              }}
              className="hidden md:flex bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base transition-all duration-200 touch-target"
              style={{
                filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.2))'
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.filter = 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.3))'
                e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                e.currentTarget.style.outlineOffset = '2px'
              }}
              onBlur={(e) => {
                e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                e.currentTarget.style.outline = 'none'
              }}
            >
              {pathname === '/partners' ? 'Sign In / Sign Up' : 'Download App'}
            </Button>
          </motion.div>

          {/* Mobile: Hamburger Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 sm:p-3 text-white hover:text-gray-300 transition-all duration-200 relative z-[60] flex-shrink-0 touch-target"
            aria-label="Toggle menu"
            style={{
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.9))',
              textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'
            }}
            initial={{ opacity: 0, rotate: -90, scale: 0 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.5,
              type: "spring",
              stiffness: 200
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.9))'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))'
              e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
              e.currentTarget.style.outlineOffset = '2px'
            }}
            onBlur={(e) => {
              e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.9))'
              e.currentTarget.style.outline = 'none'
            }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </motion.button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
        style={{
          touchAction: 'none'
        }}
      />

      {/* Mobile Menu Sidebar */}
      {mobileMenuOpen && (
        <div
          className="absolute top-0 right-0 h-full w-72 xs:w-80 sm:w-84 z-50 md:hidden animate-in slide-in-from-right duration-300 safe-area-inset"
          style={{
            background: 'rgba(13, 18, 22, 0.15)',
            backdropFilter: 'blur(25px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.3), inset 1px 0 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex flex-col h-full">
            {/* Navigation Links */}
            <nav className="flex flex-col gap-3 p-4 xs:p-6 pt-6 xs:pt-8 safe-area-top">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base sm:text-lg transition-all duration-200 py-3 sm:py-4 px-4 sm:px-5 rounded-lg whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/') ? '' : 'text-white hover:text-white'
                }`}
                style={getLinkStyles('/', false)}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Home
              </a>
              <a
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base sm:text-lg transition-all duration-200 py-3 sm:py-4 px-4 sm:px-5 rounded-lg whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/about') ? '' : 'text-white hover:text-white'
                }`}
                style={getLinkStyles('/about', false)}
                onMouseEnter={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/about')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                About
              </a>
              <a
                href="/meet-playcircle"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base sm:text-lg transition-all duration-200 py-3 sm:py-4 px-4 sm:px-5 rounded-lg whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/meet-playcircle') ? '' : 'text-white hover:text-white'
                }`}
                style={getLinkStyles('/meet-playcircle', false)}
                onMouseEnter={(e) => {
                  if (!isActive('/meet-playcircle')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/meet-playcircle')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Meet PlayCircle
              </a>
              <a
                href="/partners"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base sm:text-lg transition-all duration-200 py-3 sm:py-4 px-4 sm:px-5 rounded-lg whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/partners') ? '' : 'text-white hover:text-white'
                }`}
                style={getLinkStyles('/partners', false)}
                onMouseEnter={(e) => {
                  if (!isActive('/partners')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/partners')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Partners
              </a>
              <a
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base sm:text-lg transition-all duration-200 py-3 sm:py-4 px-4 sm:px-5 rounded-lg whitespace-nowrap focus:outline-none touch-target ${
                  isActive('/contact') ? '' : 'text-white hover:text-white'
                }`}
                style={getLinkStyles('/contact', false)}
                onMouseEnter={(e) => {
                  if (!isActive('/contact')) {
                    e.currentTarget.style.textShadow = '2px 2px 6px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/contact')) {
                    e.currentTarget.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.8)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                Contact
              </a>
            </nav>

            {/* Open App Button at Bottom */}
            <div className="mt-auto p-4 xs:p-6 border-t border-white/20 backdrop-blur-sm safe-area-bottom">
              <Button
                onClick={() => {
                  if (pathname === '/partners') {
                    window.location.href = '/partner/entry'
                  }
                }}
                className="w-full rounded-full py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 touch-target"
                style={{
                  background: '#456882',
                  color: 'white',
                  filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.2))'
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(3px 3px 8px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.3))'
                  e.currentTarget.style.outline = '2px solid rgba(255, 255, 255, 0.6)'
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                  e.currentTarget.style.outline = 'none'
                }}
              >
                {pathname === '/partners' ? 'Sign In / Sign Up' : 'Open App'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Download App Dialog */}
      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download PlayCircle App</DialogTitle>
            <DialogDescription>
              You can download the app on your phone to get the full experience.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">App Store Link:</p>
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">
              https://apps.apple.com/us/app/playcircle/id6753913576
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDownloadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDownloadDialogOpen(false)
                window.open('https://apps.apple.com/us/app/playcircle/id6753913576', '_blank')
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
