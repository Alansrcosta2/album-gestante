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
import { LogOut } from 'lucide-react'

const YOUTUBE_MUSIC_URL = ''

interface Settings {
  hero_label?: string
  hero_title?: string
  hero_subtitle?: string
  welcome_message?: string
  footer_title?: string
  footer_subtitle?: string
  background_music_url?: string
  hero_object_position?: string
}

const DEFAULTS: Settings = {
  hero_label: 'Ensaio Gestante',
  hero_title: 'Karine & Alan',
  hero_subtitle: 'À espera do nosso maior presente.',
  welcome_message: 'Este não é apenas um ensaio fotográfico. É a lembrança de um capítulo inesquecível da nossa história, marcado pelo amor, pela esperança e pela alegria de esperar o maior presente que a vida poderia nos dar.',
  footer_title: 'Karine & Alan',
  footer_subtitle: 'Ensaio Gestante',
  background_music_url: '',
  hero_object_position: 'center top',
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [fotos, setFotos] = useState<{ path: string; url: string }[]>([])
  const [heroUrl, setHeroUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUnlocked(false)
    setFotos([])
    setHeroUrl('')
    setLoading(true)
  }

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
        const filtered: Record<string, string> = {}
        for (const [key, value] of Object.entries(data.settings as Record<string, string>)) {
          if (value && value.trim()) filtered[key] = value.trim()
        }
          setSettings({ ...DEFAULTS, ...filtered })
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
        <>
          <button
            onClick={handleLogout}
            className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark/80 transition-colors"
            aria-label="Sair do álbum"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <main>
               {settings.background_music_url && <BackgroundMusic youtubeUrl={settings.background_music_url!} />}
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
        </>
      )}
    </>
  )
}
