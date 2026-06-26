'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, ZoomIn, X } from 'lucide-react'
import PhotoModal from './PhotoModal'

interface Foto {
  path: string
  url: string
}

interface Props {
  fotos: Foto[]
}

const ITEMS_PER_PAGE = 24

export default function Gallery({ fotos }: Props) {
  const [displayed, setDisplayed] = useState(ITEMS_PER_PAGE)
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  
  const [isDesktop, setIsDesktop] = useState(false)
  const [zoomedId, setZoomedId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    if (fotos.length <= displayed) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayed((prev) => Math.min(prev + ITEMS_PER_PAGE, fotos.length))
        }
      },
      { threshold: 0.1 }
    )

    const el = loaderRef.current
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [fotos.length, displayed])

  const visibleFotos = fotos.slice(0, displayed)

  function handleWheel(e: React.WheelEvent) {
    if (!isDesktop) return
    
    if (!zoomedId) {
      const target = e.target as HTMLElement
      const img = target.closest('img')
      if (!img) return
      
      const foto = visibleFotos.find(f => f.url === img.src)
      if (foto) {
        openZoom(foto)
        const delta = e.deltaY > 0 ? -0.3 : 0.3
        setZoomLevel((prev) => Math.max(1, Math.min(4, prev + delta)))
      }
      return
    }

    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    setZoomLevel((prev) => Math.max(1, Math.min(4, prev + delta)))
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDesktop || !zoomedId || !galleryRef.current) return
    
    const rect = galleryRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  function openZoom(foto: Foto) {
    setZoomedId(foto.path)
    setZoomLevel(1)
    setZoomPos({ x: 50, y: 50 })
  }

  function closeZoom() {
    setZoomedId(null)
    setZoomLevel(1)
  }

  function handlePhotoClick(index: number) {
    if (isDesktop) {
      openZoom(visibleFotos[index])
    } else {
      setModalIndex(index)
    }
  }

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-cream">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-dark mb-3">
            Galeria Completa
          </h2>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-dark/40">
            {fotos.length} fotografias
          </p>
        </motion.div>

        {isDesktop && zoomedId && (
          <div
            ref={galleryRef}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center"
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeZoom()
            }}
          >
            <img
              src={fotos.find(f => f.path === zoomedId)?.url}
              alt="Zoom"
              className="max-w-[90vw] max-h-[90vh] object-contain select-none"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transition: 'transform 0.1s ease-out'
              }}
              draggable={false}
            />
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-dark/80 backdrop-blur-sm text-white text-xs font-sans px-3 py-1.5 rounded-full select-none">
              Scroll para zoom • Clique fora ou X para sair
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {visibleFotos.map((foto, i) => (
            <motion.button
              key={foto.path}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % ITEMS_PER_PAGE) * 0.02 }}
              onClick={() => handlePhotoClick(i)}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-beige/30 focus:outline-none cursor-zoom-in"
            >
              <img
                src={foto.url}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
            </motion.button>
          ))}
        </div>

        {displayed < fotos.length && (
          <div ref={loaderRef} className="flex justify-center py-12">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-rose/50" />
            </motion.div>
          </div>
        )}

        {!isDesktop && modalIndex !== null && (
          <PhotoModal
            fotos={fotos}
            currentIndex={modalIndex}
            onClose={() => setModalIndex(null)}
            onPrev={() => setModalIndex((prev) => (prev! > 0 ? prev! - 1 : fotos.length - 1))}
            onNext={() => setModalIndex((prev) => (prev! < fotos.length - 1 ? prev! + 1 : 0))}
          />
        )}
      </div>
    </section>
  )
}
