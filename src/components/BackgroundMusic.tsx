'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [interacted, setInteracted] = useState(false)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  useEffect(() => {
    function handleFirstInteraction() {
      setInteracted(true)
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('touchstart', handleFirstInteraction, { once: true })
    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  useEffect(() => {
    if (videoIds.length === 0) return
    if (!interacted) return

    const playlist = videoIds.join(',')
    const iframe = document.querySelector('iframe[title="bg-music"]') as HTMLIFrameElement | null
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoIds[currentTrack]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
    }
    setPlaying(true)
  }, [interacted, youtubeUrl])

  function toggle() {
    const iframe = document.querySelector('iframe[title="bg-music"]') as HTMLIFrameElement | null
    if (!iframe) return
    if (playing) {
      iframe.src = ''
      setPlaying(false)
    } else {
      setPlaying(true)
    }
  }

  function nextTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const next = (currentTrack + 1) % videoIds.length
    setCurrentTrack(next)
    const playlist = videoIds.join(',')
    const iframe = document.querySelector('iframe[title="bg-music"]') as HTMLIFrameElement | null
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoIds[next]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
    }
    setPlaying(true)
  }

  function prevTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const prev = (currentTrack - 1 + videoIds.length) % videoIds.length
    setCurrentTrack(prev)
    const playlist = videoIds.join(',')
    const iframe = document.querySelector('iframe[title="bg-music"]') as HTMLIFrameElement | null
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoIds[prev]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
    }
    setPlaying(true)
  }

  function extractVideoId(url: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url

    const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (m) return m[1]

    return null
  }

  if (videoIds.length === 0) return null

  return (
    <>
      <iframe
        title="bg-music"
        className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        allow="autoplay"
        allowFullScreen
      />
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        {hasPlaylist && (
          <>
            <button
              onClick={prevTrack}
              className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors active:scale-95"
              aria-label="Música anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={nextTrack}
              className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors active:scale-95"
              aria-label="Próxima música"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={toggle}
          className="w-14 h-14 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark transition-colors active:scale-95"
          aria-label={playing ? 'Desligar música' : 'Ligar música'}
        >
          {playing ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        {hasPlaylist && (
          <div className="bg-dark/80 backdrop-blur-sm text-white/70 text-xs font-sans px-2.5 py-1 rounded-full select-none">
            {currentTrack + 1}/{videoIds.length}
          </div>
        )}

        {playing && !interacted && (
          <div className="bg-dark/80 backdrop-blur-sm text-white/90 text-xs font-sans px-3 py-1.5 rounded-full select-none animate-pulse pointer-events-none">
            Toque para ouvir
          </div>
        )}
      </div>
    </>
  )
}
