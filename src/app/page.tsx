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

const YOUTUBE_MUSIC_URL = ''

interface Settings {
  hero_label?: string
  hero_title?: string
  hero_subtitle?: string
  welcome_message?: string
  footer_title?: string
  footer_subtitle?: string
}

const DEFAULTS: Settings = {
  hero_label: 'Ensaio Gestante',
  hero_title: 'Karine & Alan',
  hero_subtitle: 'À espera do nosso maior presente.',
  welcome_message: 'Cada fotografia deste álbum registra um momento único da nossa caminhada. Entre sonhos, amor e expectativas, celebramos a beleza da espera por uma nova vida.',
  footer_title: 'Karine & Alan',
  footer_subtitle: 'Ensaio Gestante',
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [fotos, setFotos] = useState<{ path: string; url: string }[]>([])
  const [heroUrl, setHeroUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    fetch('/api/auth/check')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setUnlocked(true)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!unlocked) return

    async function load() {
      const [fotosRes, settingsRes] = await Promise.all([
        fetch('/api/fotos'),
        fetch('/api/settings'),
      ])

      if (fotosRes.ok) {
        const { fotos: fotosComUrl } = await fotosRes.json()
        setFotos(fotosComUrl)
        if (fotosComUrl.length > 0) {
          setHeroUrl(fotosComUrl[0].url)
        }
      }

      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.settings) {
          setSettings({ ...DEFAULTS, ...data.settings })
        }
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
              {heroUrl && <HeroSection heroUrl={heroUrl} label={settings.hero_label!} title={settings.hero_title!} subtitle={settings.hero_subtitle!} />}
              <WelcomeMessage message={settings.welcome_message!} />
              <Highlights fotos={fotos} />
              <Gallery fotos={fotos} />
              <Footer title={settings.footer_title!} subtitle={settings.footer_subtitle!} />
            </>
          )}
        </main>
      )}
    </>
  )
}
