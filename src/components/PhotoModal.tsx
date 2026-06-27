'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

interface Props {
  fotos: { path: string; url: string }[]
  currentIndex: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function PhotoModal({ fotos, currentIndex, onClose, onPrev, onNext }: Props) {
  const current = fotos[currentIndex]
  const touchX = useRef(0)
  const [isDesktop, setIsDesktop] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const lastClickRef = useRef(0)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024)
  }, [])

  // Reset zoom when changing photos
  useEffect(() => {
    setZoomLevel(1)
  }, [currentIndex])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomLevel > 1) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      if (diff > 0) onNext()
      else onPrev()
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!isDesktop) return
    const delta = e.deltaY > 0 ? -0.5 : 0.5
    setZoomLevel((prev) => Math.max(1, Math.min(4, prev + delta)))
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isDesktop || zoomLevel === 1) return
    const now = Date.now()
    if (now - lastClickRef.current < 300) {
      setZoomLevel(1)
    }
    lastClickRef.current = now
  }

  const handleDownload = async () => {
    try {
      const resp = await fetch(current.url)
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = current.path.split('/').pop() || 'foto.jpg'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(current.url, '_blank')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <span className="font-sans text-xs text-white/50">
            {currentIndex + 1} / {fotos.length}
          </span>

          <button
            onClick={handleDownload}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>

        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          src={current.url}
          alt={`Foto ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain p-4 select-none cursor-zoom-in"
          draggable={false}
          onClick={handleImageClick}
          onWheel={handleWheel}
          style={isDesktop && zoomLevel > 1 ? {
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.15s ease-out',
          } : undefined}
        />

        {fotos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
