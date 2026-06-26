'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  function extractVideoId(url: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (m) return m[1]
    return null
  }

  function getSrc(videoId: string, autoPlay: number, mute: number) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay}&loop=1&playlist=${videoIds.join(',')}&mute=${mute}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1`
  }

  function startPlayback() {
    setUnlocked(true)
    setPlaying(true)
    setIframeKey((k) => k + 1)
  }

  function toggle() {
    if (playing) {
      setPlaying(false)
      setIframeKey((k) => k + 1)
    } else {
      startPlayback()
    }
  }

  function nextTrack() {
    if (!hasPlaylist) return
    setCurrentTrack((prev) => (prev + 1) % videoIds.length)
    setPlaying(true)
    setIframeKey((k) => k + 1)
  }

  function prevTrack() {
    if (!hasPlaylist) return
    setCurrentTrack((prev) => (prev - 1 + videoIds.length) % videoIds.length)
    setPlaying(true)
    setIframeKey((k) => k + 1)
  }

  const iframeSrc = playing && videoIds[currentTrack]
    ? getSrc(videoIds[currentTrack], 1, unlocked ? 0 : 1)
    : ''

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
          {playing ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      {!unlocked && playing && (
        <div className="bg-dark/80 backdrop-blur-sm text-white text-xs font-sans px-3 py-1.5 rounded-full animate-pulse select-none">
          Toque para ouvir
        </div>
      )}

      {playing && unlocked && hasPlaylist && (
        <div className="bg-dark/80 backdrop-blur-sm text-white/70 text-xs font-sans px-2.5 py-1 rounded-full select-none">
          {currentTrack + 1}/{videoIds.length}
        </div>
      )}

      {iframeSrc && (
        <iframe
          key={iframeKey}
          src={iframeSrc}
          className="fixed bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="bg-music"
        />
      )}
    </div>
  )
}
