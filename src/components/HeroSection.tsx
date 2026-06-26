'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface Props {
  heroUrl: string
}

export default function HeroSection({ heroUrl }: Props) {
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
          Ensaio Gestante
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl mb-3 leading-tight"
        >
          Karine & Alan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="font-sans text-sm md:text-base text-white/70 font-light italic tracking-wide"
        >
          À espera do nosso maior presente.
        </motion.p>

        
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-white/60" />
      </motion.div>
    </section>
  )
}
