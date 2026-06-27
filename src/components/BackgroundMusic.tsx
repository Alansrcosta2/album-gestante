'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnmuted, setHasUnmuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasUnmutedRef = useRef(false)
  const isPlayingRef = useRef(false)
  const currentTrackRef = useRef(0)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  function extractVideoId(url: string): string | null {
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
    const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    if (m) return m[1]
    return null
  }

  function postMessage(func: string, args?: any) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      'https://www.youtube.com'
    )
  }

  function getSrc(videoId: string) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1`
  }

  // Load first video on mount
  useEffect(() => {
    if (videoIds.length === 0 || !iframeRef.current) return
    iframeRef.current.src = getSrc(videoIds[0])
    setIsPlaying(true)
    isPlayingRef.current = true
  }, [videoIds.length])

  // Click anywhere to unmute
  useEffect(() => {
    function handleClick() {
      if (hasUnmutedRef.current) return
      hasUnmutedRef.current = true
      setHasUnmuted(true)
      postMessage('unMute')
      postMessage('playVideo')
      setIsPlaying(true)
      isPlayingRef.current = true
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function toggle() {
    if (!hasUnmutedRef.current) {
      hasUnmutedRef.current = true
      setHasUnmuted(true)
      postMessage('unMute')
      postMessage('playVideo')
      setIsPlaying(true)
      isPlayingRef.current = true
      return
    }
    if (isPlayingRef.current) {
      postMessage('pauseVideo')
      setIsPlaying(false)
      isPlayingRef.current = false
    } else {
      postMessage('playVideo')
      setIsPlaying(true)
      isPlayingRef.current = true
    }
  }

  function nextTrack() {
    if (!hasPlaylist) return
    const next = (currentTrackRef.current + 1) % videoIds.length
    currentTrackRef.current = next
    setCurrentTrack(next)
    if (!iframeRef.current) return
    iframeRef.current.src = getSrc(videoIds[next])
    setIsPlaying(true)
    isPlayingRef.current = true
  }

  function prevTrack() {
    if (!hasPlaylist) return
    const prev = (currentTrackRef.current - 1 + videoIds.length) % videoIds.length
    currentTrackRef.current = prev
    setCurrentTrack(prev)
    if (!iframeRef.current) return
    iframeRef.current.src = getSrc(videoIds[prev])
    setIsPlaying(true)
    isPlayingRef.current = true
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
        {isPlaying && hasUnmuted ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      {isPlaying && hasPlaylist && (
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
