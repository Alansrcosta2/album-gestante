'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
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
  const [selectedId, setSelectedId] = useState<string | null>(null)

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {visibleFotos.map((foto, i) => (
            <motion.button
              key={foto.path}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % ITEMS_PER_PAGE) * 0.02 }}
              onClick={() => setModalIndex(i)}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-beige/30 focus:outline-none"
            >
              <img
                src={foto.url}
                alt={`Foto ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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

        {modalIndex !== null && (
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
