'use client'

import { useRef, useEffect } from 'react'

export function Showreel({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => { /* autoplay prevented by browser policy */ })
    }
  }, [])

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-6 left-6 text-white pointer-events-none">
        <h3 className="text-xl font-bold">Uprising Studio</h3>
        <p className="text-sm opacity-80">Operating System</p>
      </div>
    </div>
  )
}
