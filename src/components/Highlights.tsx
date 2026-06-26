'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  fotos: { path: string; url: string }[]
}

export default function Highlights({ fotos }: Props) {
  const [current, setCurrent] = useState(0)
  const destaques = fotos.slice(0, Math.min(18, fotos.length))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % destaques.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [destaques.length])

  const prev = () => setCurrent((c) => (c === 0 ? destaques.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c + 1) % destaques.length)

  if (destaques.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-beige/30">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif text-2xl md:text-3xl text-center text-dark mb-3"
        >
          Momentos em Destaque
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-sans text-xs uppercase tracking-[0.25em] text-center text-dark/40 mb-12"
        >
          Os clicks mais especiais
        </motion.p>

        <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-beige/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={destaques[current].url}
                alt={`Destaque ${current + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-dark" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-dark" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {destaques.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? 'bg-gold w-6' : 'bg-gold/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
