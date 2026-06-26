'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import PasswordGate from '@/components/PasswordGate'
import HeroSection from '@/components/HeroSection'
import WelcomeMessage from '@/components/WelcomeMessage'
import Highlights from '@/components/Highlights'
import Gallery from '@/components/Gallery'
import Footer from '@/components/Footer'
import BackgroundMusic from '@/components/BackgroundMusic'

// Mude aqui a URL do YouTube para a música que quiser
const YOUTUBE_MUSIC_URL = ''

interface Foto {
  id: number
  titulo: string
  ordem: number
  signedUrl: string
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [fotos, setFotos] = useState<{ path: string; url: string }[]>([])
  const [heroUrl, setHeroUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!unlocked) return

    async function load() {
      const res = await fetch('/api/fotos')
      if (!res.ok) {
        setLoading(false)
        return
      }

      const { fotos: fotosComUrl } = await res.json()
      setFotos(fotosComUrl)
      if (fotosComUrl.length > 0) {
        setHeroUrl(fotosComUrl[0].url)
      }
      setLoading(false)
    }

    load()
  }, [unlocked])

  return (
    <>
      <AnimatePresence>
        {!unlocked && (
          <PasswordGate onUnlock={() => setUnlocked(true)} />
        )}
      </AnimatePresence>

      {unlocked && (
        <main>
          {YOUTUBE_MUSIC_URL && <BackgroundMusic youtubeUrl={YOUTUBE_MUSIC_URL} />}
          {loading ? (
            <div className="h-screen flex items-center justify-center bg-cream">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-sans text-xs text-dark/40 tracking-wider uppercase">
                  Carregando álbum...
                </p>
              </div>
            </div>
          ) : (
            <>
              {heroUrl && <HeroSection heroUrl={heroUrl} />}
              <WelcomeMessage />
              <Highlights fotos={fotos} />
              <Gallery fotos={fotos} />
              <Footer />
            </>
          )}
        </main>
      )}
    </>
  )
}
