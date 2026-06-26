'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const urls = youtubeUrl.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter(Boolean) as string[]
  const hasPlaylist = videoIds.length > 1

  useEffect(() => {
    if (videoIds.length === 0) return
    if (!iframeRef.current) return

    const playlist = videoIds.join(',')
    iframeRef.current.src = `https://www.youtube.com/embed/${videoIds[0]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
    setPlaying(true)
  }, [youtubeUrl])

  function toggle() {
    if (!iframeRef.current) return
    if (playing) {
      iframeRef.current.src = ''
      setPlaying(false)
    } else if (videoIds.length > 0) {
      const playlist = videoIds.join(',')
      iframeRef.current.src = `https://www.youtube.com/embed/${videoIds[currentTrack]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
      setPlaying(true)
    }
  }

  function nextTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const next = (currentTrack + 1) % videoIds.length
    setCurrentTrack(next)
    if (iframeRef.current) {
      const playlist = videoIds.join(',')
      iframeRef.current.src = `https://www.youtube.com/embed/${videoIds[next]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
      setPlaying(true)
    }
  }

  function prevTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    const prev = (currentTrack - 1 + videoIds.length) % videoIds.length
    setCurrentTrack(prev)
    if (iframeRef.current) {
      const playlist = videoIds.join(',')
      iframeRef.current.src = `https://www.youtube.com/embed/${videoIds[prev]}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
      setPlaying(true)
    }
  }

  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return null
  }

  if (videoIds.length === 0) return null

  return (
    <>
      <iframe
        ref={iframeRef}
        className="hidden"
        allow="autoplay"
        title="bg-music"
      />
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        {hasPlaylist && (
          <>
            <button
              onClick={prevTrack}
              className="w-8 h-8 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
              aria-label="Música anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={nextTrack}
              className="w-8 h-8 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center hover:bg-dark transition-colors"
              aria-label="Próxima música"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark transition-colors"
          aria-label={playing ? 'Desligar música' : 'Ligar música'}
        >
          {playing ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
      {hasPlaylist && (
        <div className="fixed bottom-6 left-[88px] z-40 bg-dark/80 backdrop-blur-sm text-white/70 text-[10px] font-sans px-2 py-1 rounded-full">
          {currentTrack + 1}/{videoIds.length}
        </div>
      )}
    </>
  )
}
