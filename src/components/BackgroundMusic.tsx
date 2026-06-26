'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTrack, setCurrentTrack] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  function extractVideoId(url: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (m) return m[1]
    return null
  }

  function getSrc(videoId: string, muted: boolean) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoIds.join(',')}&mute=${muted ? 1 : 0}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1`
  }

  // Toca automaticamente mudo ao abrir
  useEffect(() => {
    if (videoIds.length === 0 || !iframeRef.current) return
    iframeRef.current.src = getSrc(videoIds[currentTrack], true)
    setIsPlaying(true)
    setIsMuted(true)
  }, [youtubeUrl])

  // Clique em qualquer lugar ativa o som
  useEffect(() => {
    if (!isPlaying || !isMuted) return

    function unlock() {
      setIsMuted(false)
      if (iframeRef.current && videoIds[currentTrack]) {
        iframeRef.current.src = getSrc(videoIds[currentTrack], false)
      }
    }

    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [isPlaying, isMuted, currentTrack, videoIds])

  function toggle() {
    if (!iframeRef.current) return
    if (isPlaying) {
      iframeRef.current.src = ''
      setIsPlaying(false)
      setIsMuted(true)
    } else if (videoIds.length > 0) {
      iframeRef.current.src = getSrc(videoIds[currentTrack], false)
      setIsPlaying(true)
      setIsMuted(false)
    }
  }

  function nextTrack() {
    if (!hasPlaylist) return
    const next = (currentTrack + 1) % videoIds.length
    setCurrentTrack(next)
    if (isPlaying && iframeRef.current) {
      iframeRef.current.src = getSrc(videoIds[next], isMuted)
    }
  }

  function prevTrack() {
    if (!hasPlaylist) return
    const prev = (currentTrack - 1 + videoIds.length) % videoIds.length
    setCurrentTrack(prev)
    if (isPlaying && iframeRef.current) {
      iframeRef.current.src = getSrc(videoIds[prev], isMuted)
    }
  }

  if (videoIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
      {hasPlaylist && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevTrack() }}
            className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
            aria-label="Música anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextTrack() }}
            className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
            aria-label="Próxima música"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggle() }}
        className="w-14 h-14 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark transition-colors"
        aria-label={isPlaying ? 'Desligar música' : 'Ligar música'}
      >
        {isPlaying && !isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      {isPlaying && isMuted && (
        <div className="bg-dark/80 backdrop-blur-sm text-white text-xs font-sans px-3 py-1.5 rounded-full animate-pulse select-none">
          Toque para ouvir
        </div>
      )}

      {isPlaying && !isMuted && hasPlaylist && (
        <div className="bg-dark/80 backdrop-blur-sm text-white/70 text-xs font-sans px-2.5 py-1 rounded-full select-none">
          {currentTrack + 1}/{videoIds.length}
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="bg-music"
      />
    </div>
  )
}
