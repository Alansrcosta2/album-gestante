'use client'

import { motion } from 'framer-motion'

export default function WelcomeMessage() {
  return (
    <section id="welcome" className="py-20 md:py-28 px-6 bg-cream">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="w-12 h-px bg-gold mx-auto mb-8" />
        <p className="font-serif text-lg md:text-xl leading-relaxed text-dark/80 italic">
          &ldquo;Cada fotografia deste álbum registra um momento único da nossa caminhada.
          Entre sonhos, amor e expectativas, celebramos a beleza da espera por uma nova vida.&rdquo;
        </p>
        <div className="w-12 h-px bg-gold mx-auto mt-8" />
      </motion.div>
    </section>
  )
}
