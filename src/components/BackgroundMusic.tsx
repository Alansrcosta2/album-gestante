'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

interface Props {
  youtubeUrl: string
}

export default function BackgroundMusic({ youtubeUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function toggle() {
    if (!iframeRef.current) return
    const src = iframeRef.current.src

    if (playing) {
      iframeRef.current.src = ''
      setPlaying(false)
    } else {
      const videoId = extractVideoId(youtubeUrl)
      if (videoId) {
        iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&iv_load_policy=3&modestbranding=1&rel=0`
        setPlaying(true)
      }
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

  const videoId = extractVideoId(youtubeUrl)
  if (!videoId) return null

  return (
    <>
      <iframe
        ref={iframeRef}
        className="hidden"
        allow="autoplay"
        title="bg-music"
      />
      <button
        onClick={toggle}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-dark/80 backdrop-blur-sm text-white flex items-center justify-center shadow-lg hover:bg-dark transition-colors"
        aria-label={playing ? 'Desligar música' : 'Ligar música'}
      >
        {playing ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </>
  )
}
