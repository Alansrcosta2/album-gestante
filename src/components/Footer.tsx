'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
}

export default function Footer({ title, subtitle }: Props) {
  return (
    <footer className="py-12 bg-dark text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-md mx-auto px-6"
      >
        <Heart className="w-5 h-5 mx-auto mb-4 text-rose/60" />
        <p className="font-serif text-lg text-white/80 mb-2">
          {title}
        </p>
        <p className="font-sans text-xs text-white/30 tracking-wider uppercase">
          {subtitle}
        </p>
        <div className="w-8 h-px bg-gold/30 mx-auto mt-6 mb-4" />
        <p className="font-sans text-[10px] text-white/20 tracking-widest uppercase">
          &copy; {new Date().getFullYear()} &mdash; Todos os direitos reservados
        </p>
      </motion.div>
    </footer>
  )
}
