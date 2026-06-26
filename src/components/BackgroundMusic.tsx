'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [muted, setMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  function getVideoSrc(videoId: string, mutedParam: boolean) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoIds.join(',')}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0&mute=${mutedParam ? 1 : 0}`
  }

  useEffect(() => {
    if (videoIds.length === 0 || !iframeRef.current) return
    iframeRef.current.src = getVideoSrc(videoIds[currentTrack], true)
    setPlaying(true)
    setMuted(true)
  }, [youtubeUrl])

  useEffect(() => {
    function unlock() {
      if (!playing || !muted) return
      setMuted(false)
      if (iframeRef.current && videoIds[currentTrack]) {
        iframeRef.current.src = getVideoSrc(videoIds[currentTrack], false)
      }
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
    document.addEventListener('click', unlock, { once: true })
    document.addEventListener('touchstart', unlock, { once: true })
    return () => {
      document.removeEventListener('click', unlock)
      document.removeEventListener('touchstart', unlock)
    }
  }, [playing, muted, currentTrack, videoIds])

  function toggle() {
    if (!iframeRef.current) return
    if (playing) {
      iframeRef.current.src = ''
      setPlaying(false)
      setMuted(true)
    } else if (videoIds.length > 0) {
      iframeRef.current.src = getVideoSrc(videoIds[currentTrack], false)
      setPlaying(true)
      setMuted(false)
    }
  }

  function nextTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const next = (currentTrack + 1) % videoIds.length
    setCurrentTrack(next)
    setPlaying(true)
    setMuted(false)
    if (iframeRef.current) {
      iframeRef.current.src = getVideoSrc(videoIds[next], false)
    }
  }

  function prevTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const prev = (currentTrack - 1 + videoIds.length) % videoIds.length
    setCurrentTrack(prev)
    setPlaying(true)
    setMuted(false)
    if (iframeRef.current) {
      iframeRef.current.src = getVideoSrc(videoIds[prev], false)
    }
  }

  function extractVideoId(url: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (m) return m[1]
    return null
  }

  if (videoIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
      {hasPlaylist && (
        <>
          <button
            onClick={prevTrack}
            className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
            aria-label="Música anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={nextTrack}
            className="w-10 h-10 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
            aria-label="Próxima música"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </>
      )}

      <button
        onClick={toggle}
        className="w-14 h-14 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark transition-colors"
        aria-label={playing ? 'Desligar música' : 'Ligar música'}
      >
        {playing ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      {playing && muted && (
        <div className="bg-dark/80 backdrop-blur-sm text-white text-xs font-sans px-3 py-1.5 rounded-full animate-pulse select-none">
          Toque para ouvir
        </div>
      )}

      {playing && !muted && hasPlaylist && (
        <div className="bg-dark/80 backdrop-blur-sm text-white/70 text-xs font-sans px-2.5 py-1 rounded-full select-none">
          {currentTrack + 1}/{videoIds.length}
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        allow="autoplay"
        allowFullScreen
        title="bg-music"
      />
    </div>
  )
}
