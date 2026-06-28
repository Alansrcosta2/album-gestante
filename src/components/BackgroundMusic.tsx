'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export interface MusicHandle {
  unmute: () => void
}

const BackgroundMusic = forwardRef<MusicHandle, Props>(({ youtubeUrl }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnmuted, setHasUnmuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const unmutedRef = useRef(false)
  const playingRef = useRef(false)
  const trackRef = useRef(0)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const hasPlaylist = urls.length > 1
  const count = urls.length

  const urlsRef = useRef(urls)
  urlsRef.current = urls

  function unmute() {
    if (unmutedRef.current) return
    unmutedRef.current = true
    setHasUnmuted(true)
    const audio = audioRef.current
    if (audio) {
      if (!audio.src) audio.src = urls[trackRef.current]
      audio.play().then(() => {
        setIsPlaying(true)
        playingRef.current = true
      }).catch(() => {})
    }
  }

  useImperativeHandle(ref, () => ({ unmute }), [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    function onClick() {
      if (!unmutedRef.current) unmute()
    }
    document.addEventListener('click', onClick)

    function onEnded() {
      const el = audioRef.current
      if (!el) return
      const next = trackRef.current + 1
      if (next < urlsRef.current.length) {
        trackRef.current = next
        setCurrentTrack(next)
        el.src = urlsRef.current[next]
        el.play().then(() => {
          setIsPlaying(true)
          playingRef.current = true
        }).catch(() => {})
      } else {
        setIsPlaying(false)
        playingRef.current = false
      }
    }
    audio.addEventListener('ended', onEnded)

    return () => {
      document.removeEventListener('click', onClick)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return

    if (!unmutedRef.current) {
      unmute()
      return
    }

    if (playingRef.current) {
      audio.pause()
      setIsPlaying(false)
      playingRef.current = false
    } else {
      if (!audio.src) {
        audio.src = urls[trackRef.current]
      }
      audio.play().then(() => {
        setIsPlaying(true)
        playingRef.current = true
      }).catch(() => {})
    }
  }

  function loadTrack(index: number) {
    const audio = audioRef.current
    if (!audio) return
    trackRef.current = index
    setCurrentTrack(index)
    audio.src = urls[index]
    if (unmutedRef.current) {
      audio.play().then(() => {
        setIsPlaying(true)
        playingRef.current = true
      }).catch(() => {})
    }
  }

  function nextTrack() {
    if (trackRef.current < count - 1) {
      loadTrack(trackRef.current + 1)
    }
  }

  function prevTrack() {
    if (trackRef.current > 0) {
      loadTrack(trackRef.current - 1)
    }
  }

  if (count === 0) return null

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
          {currentTrack + 1}/{count}
        </div>
      )}

      <audio ref={audioRef} preload="auto" />
    </div>
  )
})

BackgroundMusic.displayName = 'BackgroundMusic'
export default BackgroundMusic
