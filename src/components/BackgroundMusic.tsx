'use client'

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export interface MusicHandle {
  unmute: () => void
}

function extractVideoId(url: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  const m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function videoSrc(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0&playsinline=1`
}

function post(iframe: HTMLIFrameElement | null, func: string, args?: any) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: 'command', func, args }),
    'https://www.youtube.com'
  )
}

const BackgroundMusic = forwardRef<MusicHandle, Props>(({ youtubeUrl }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnmuted, setHasUnmuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const unmutedRef = useRef(false)
  const playingRef = useRef(false)
  const trackRef = useRef(0)
  const loadingRef = useRef(false)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  const idsRef = useRef(videoIds)
  const playListRef = useRef(hasPlaylist)
  idsRef.current = videoIds
  playListRef.current = hasPlaylist

  function playAfterLoad() {
    const el = iframeRef.current
    if (!el || !unmutedRef.current) return
    loadingRef.current = false
    setTimeout(() => {
      post(el, 'seekTo', 0)
      post(el, 'unMute')
      post(el, 'playVideo')
      setIsPlaying(true)
      playingRef.current = true
    }, 800)
  }

  function startVideo(index: number) {
    trackRef.current = index
    setCurrentTrack(index)
    const el = iframeRef.current
    if (!el) return
    loadingRef.current = true
    el.src = videoSrc(idsRef.current[index])
  }

  function unmute() {
    if (unmutedRef.current) return
    unmutedRef.current = true
    setHasUnmuted(true)
    startVideo(trackRef.current)
  }

  useImperativeHandle(ref, () => ({ unmute }), [])

  useEffect(() => {
    function onClick() {
      if (!unmutedRef.current) unmute()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    const el = iframeRef.current
    if (!el) return
    function onLoad() {
      if (loadingRef.current) playAfterLoad()
    }
    el.addEventListener('load', onLoad)
    return () => el.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== 'https://www.youtube.com') return
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'onStateChange' && data.info === 0 && playListRef.current) {
          startVideo((trackRef.current + 1) % idsRef.current.length)
        }
      } catch {}
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function toggle() {
    if (!unmutedRef.current) { unmute(); return }
    if (playingRef.current) {
      post(iframeRef.current, 'pauseVideo')
      setIsPlaying(false)
      playingRef.current = false
    } else {
      post(iframeRef.current, 'playVideo')
      setIsPlaying(true)
      playingRef.current = true
    }
  }

  function nextTrack() {
    if (!hasPlaylist) return
    startVideo((trackRef.current + 1) % videoIds.length)
  }

  function prevTrack() {
    if (!hasPlaylist) return
    startVideo((trackRef.current - 1 + videoIds.length) % videoIds.length)
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
        className="fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="bg-music"
      />
    </div>
  )
})

BackgroundMusic.displayName = 'BackgroundMusic'
export default BackgroundMusic
