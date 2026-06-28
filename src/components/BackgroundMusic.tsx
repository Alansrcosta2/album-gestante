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

let apiLoaded = false

function ensureAPI(cb: () => void) {
  if (apiLoaded) { cb(); return }
  if ((window as any).YT?.Player) { apiLoaded = true; cb(); return }

  const check = setInterval(() => {
    if ((window as any).YT?.Player) {
      apiLoaded = true
      clearInterval(check)
      cb()
    }
  }, 200)

  if (!document.querySelector<HTMLScriptElement>('script[src*="youtube.com/iframe_api"]')) {
    ;(window as any).onYouTubeIframeAPIReady = () => {
      apiLoaded = true
      cb()
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  }
}

const BackgroundMusic = forwardRef<MusicHandle, Props>(({ youtubeUrl }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnmuted, setHasUnmuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const playerRef = useRef<any>(null)
  const readyRef = useRef(false)
  const unmutedRef = useRef(false)
  const playingRef = useRef(false)
  const trackRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const urls = youtubeUrl.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
  const videoIds = urls.map(extractVideoId).filter((id): id is string => id !== null)
  const hasPlaylist = videoIds.length > 1

  const idsRef = useRef(videoIds)
  const playListRef = useRef(hasPlaylist)
  idsRef.current = videoIds
  playListRef.current = hasPlaylist

  function initPlayer(videoId: string, cb?: () => void) {
    if (playerRef.current) return
    ensureAPI(() => {
      if (playerRef.current || !containerRef.current) return
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        videoId,
        playerVars: {
          autoplay: 0,
          mute: 1,
          enablejsapi: 1,
          controls: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            readyRef.current = true
            cb?.()
          },
          onStateChange: (e: any) => {
            if (e.data === 0 && playListRef.current) {
              const next = (trackRef.current + 1) % idsRef.current.length
              trackRef.current = next
              setCurrentTrack(next)
              const p = playerRef.current
              if (p && unmutedRef.current) {
                p.loadVideoById(idsRef.current[next])
                p.playVideo()
                setIsPlaying(true)
                playingRef.current = true
              }
            }
          },
        },
      })
    })
  }

  function unmute() {
    if (unmutedRef.current) return
    unmutedRef.current = true
    setHasUnmuted(true)

    if (!playerRef.current) {
      initPlayer(videoIds[trackRef.current], () => {
        const p = playerRef.current
        if (p) {
          p.unMute()
          p.playVideo()
          setIsPlaying(true)
          playingRef.current = true
        }
      })
    } else {
      const p = playerRef.current
      if (p) {
        p.unMute()
        p.playVideo()
        setIsPlaying(true)
        playingRef.current = true
      }
    }
  }

  useImperativeHandle(ref, () => ({ unmute }), [])

  useEffect(() => {
    function onClick() {
      if (!unmutedRef.current) unmute()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function toggle() {
    if (!unmutedRef.current) { unmute(); return }
    if (playingRef.current) {
      playerRef.current?.pauseVideo()
      setIsPlaying(false)
      playingRef.current = false
    } else {
      playerRef.current?.playVideo()
      setIsPlaying(true)
      playingRef.current = true
    }
  }

  function loadTrack(index: number) {
    trackRef.current = index
    setCurrentTrack(index)
    if (unmutedRef.current && playerRef.current) {
      playerRef.current.loadVideoById(videoIds[index])
      playerRef.current.playVideo()
      setIsPlaying(true)
      playingRef.current = true
    }
  }

  function nextTrack() {
    if (!hasPlaylist) return
    loadTrack((trackRef.current + 1) % videoIds.length)
  }

  function prevTrack() {
    if (!hasPlaylist) return
    loadTrack((trackRef.current - 1 + videoIds.length) % videoIds.length)
  }

  useEffect(() => {
    return () => playerRef.current?.destroy()
  }, [])

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

      <div
        ref={containerRef}
        className="fixed bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  )
})

BackgroundMusic.displayName = 'BackgroundMusic'
export default BackgroundMusic
