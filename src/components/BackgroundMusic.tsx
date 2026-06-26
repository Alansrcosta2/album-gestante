'use client'

import { useState } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  const playlist = videoIds.join(',')
  const currentVideoId = videoIds[currentTrack] || ''
  const iframeSrc = playing && currentVideoId
    ? `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
    : ''

  function toggle() {
    setPlaying((p) => !p)
  }

  function nextTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    setCurrentTrack((prev) => (prev + 1) % videoIds.length)
    setPlaying(true)
  }

  function prevTrack() {
    if (!hasPlaylist || videoIds.length === 0) return
    setCurrentTrack((prev) => (prev - 1 + videoIds.length) % videoIds.length)
    setPlaying(true)
  }

  function extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
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

      <iframe
        src={iframeSrc}
        className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
        allow="autoplay"
        title="bg-music"
      />
    </div>
  )
}
