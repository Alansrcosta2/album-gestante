'use client'

import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface Props {
  heroUrl: string
  label: string
  title: string
  subtitle: string
  onEnterGallery?: () => void
}

export default function HeroSection({ heroUrl, label, title, subtitle, onEnterGallery }: Props) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <img
          src={heroUrl}
          alt="Ensaio Gestante"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-sans text-xs uppercase tracking-[0.3em] mb-4 text-white/80"
        >
          {label}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl mb-3 leading-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="font-sans text-sm md:text-base text-white/70 font-light italic tracking-wide mb-10"
        >
          {subtitle}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          onClick={onEnterGallery}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/20 backdrop-blur-md text-white font-sans text-sm tracking-wide border border-white/30 hover:bg-white/30 transition-all"
        >
          Entrar na Galeria
          <ArrowDown className="w-4 h-4" />
        </motion.button>
      </div>
    </section>
  )
}
