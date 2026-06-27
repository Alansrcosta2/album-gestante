'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUnmuted, setHasUnmuted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasUnmutedRef = useRef(false)
  const isPlayingRef = useRef(false)
  const videoIdsRef = useRef<string[]>([])
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

  useEffect(() => {
    videoIdsRef.current = videoIds
  }, [videoIds])

  useEffect(() => {
    if (videoIds.length === 0) return

    function createPlayer() {
      if (!containerRef.current) return
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        videoId: videoIds[0],
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!playerRef.current) return
            playerRef.current.playVideo()
            setIsPlaying(true)
            isPlayingRef.current = true
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED && videoIdsRef.current.length > 1) {
              const next = (currentTrackRef.current + 1) % videoIdsRef.current.length
              currentTrackRef.current = next
              setCurrentTrack(next)
              playerRef.current.loadVideoById(videoIdsRef.current[next])
            }
          },
        },
      })
    }

    if (typeof window.YT !== 'undefined' && window.YT.loaded) {
      createPlayer()
    } else {
      window.onYouTubeIframeAPIReady = createPlayer
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [videoIds.length])

  useEffect(() => {
    function handleClick() {
      if (!playerRef.current || hasUnmutedRef.current) return
      hasUnmutedRef.current = true
      setHasUnmuted(true)
      playerRef.current.unMute()
      playerRef.current.playVideo()
      setIsPlaying(true)
      isPlayingRef.current = true
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function toggle() {
    if (!playerRef.current) return
    if (!hasUnmutedRef.current) {
      hasUnmutedRef.current = true
      setHasUnmuted(true)
      playerRef.current.unMute()
      playerRef.current.playVideo()
      setIsPlaying(true)
      isPlayingRef.current = true
      return
    }
    if (isPlayingRef.current) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
      isPlayingRef.current = false
    } else {
      playerRef.current.playVideo()
      setIsPlaying(true)
      isPlayingRef.current = true
    }
  }

  function nextTrack() {
    if (!hasPlaylist || !playerRef.current) return
    const next = (currentTrackRef.current + 1) % videoIds.length
    currentTrackRef.current = next
    setCurrentTrack(next)
    playerRef.current.loadVideoById(videoIds[next])
    setIsPlaying(true)
    isPlayingRef.current = true
  }

  function prevTrack() {
    if (!hasPlaylist || !playerRef.current) return
    const prev = (currentTrackRef.current - 1 + videoIds.length) % videoIds.length
    currentTrackRef.current = prev
    setCurrentTrack(prev)
    playerRef.current.loadVideoById(videoIds[prev])
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

      <div ref={containerRef} className="fixed bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none" />
    </div>
  )
}
