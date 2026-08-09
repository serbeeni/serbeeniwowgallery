import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DARNASSUS_VIDEO_ID,
  WOW_PLAYLIST_ID,
  YOUTUBE_IFRAME_API,
} from '../config/assets'

interface YTPlayer {
  loadVideoById(videoId: string): void
  loadPlaylist(options: { list: string; listType: string; index: number }): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number): void
  setVolume(volume: number): void
  getVideoData(): { title?: string } | undefined
}

interface YTStateChangeEvent {
  data: number
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: string | HTMLElement,
        options: {
          height: string
          width: string
          videoId: string
          playerVars: Record<string, number>
          events: {
            onReady: () => void
            onStateChange: (event: YTStateChangeEvent) => void
          }
        },
      ) => YTPlayer
      PlayerState: { ENDED: number; PLAYING: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

/** Resolves once the IFrame API is on the page; shared so StrictMode cannot load it twice. */
let apiReady: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (apiReady) return apiReady

  apiReady = new Promise<void>((resolve) => {
    if (window.YT?.Player) {
      resolve()
      return
    }

    window.onYouTubeIframeAPIReady = () => resolve()

    const script = document.createElement('script')
    script.src = YOUTUBE_IFRAME_API
    document.head.appendChild(script)
  })

  return apiReady
}

export interface MusicState {
  isPlaying: boolean
  /** Title of the current track, or null when nothing is playing. */
  trackTitle: string | null
  volume: number
  toggle: () => void
  setVolume: (value: number) => void
  /** Attach to the hidden container the player iframe replaces. */
  containerId: string
}

const CONTAINER_ID = 'youtube-audio-player'

/**
 * Background music: the Darnassus theme on first play, then random picks from the WoW
 * playlist — the same behaviour, and the same single-track loop, as the theme.
 */
export function useYouTubePlayer(): MusicState {
  const playerRef = useRef<YTPlayer | null>(null)
  const readyRef = useRef(false)
  const firstPlayRef = useRef(true)
  const isPlayingRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [trackTitle, setTrackTitle] = useState<string | null>(null)
  const [volume, setVolumeState] = useState(100)

  useEffect(() => {
    let cancelled = false

    void loadYouTubeApi().then(() => {
      if (cancelled || playerRef.current || !window.YT) return

      playerRef.current = new window.YT.Player(CONTAINER_ID, {
        height: '1',
        width: '1',
        videoId: DARNASSUS_VIDEO_ID,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1 },
        events: {
          onReady: () => {
            readyRef.current = true
          },
          onStateChange: (event) => {
            const states = window.YT?.PlayerState
            if (!states) return

            // A finished single track restarts; the playlist advances on its own.
            if (event.data === states.ENDED && isPlayingRef.current) {
              playerRef.current?.seekTo(0)
              playerRef.current?.playVideo()
            }

            if (event.data === states.PLAYING) {
              const title = playerRef.current?.getVideoData()?.title
              setTrackTitle(title && isPlayingRef.current ? `♪ ${title}` : null)
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
    }
  }, [])

  const toggle = useCallback(() => {
    const player = playerRef.current
    if (!player || !readyRef.current) return

    if (!isPlayingRef.current) {
      if (firstPlayRef.current) {
        player.loadVideoById(DARNASSUS_VIDEO_ID)
        player.playVideo()
        firstPlayRef.current = false
      } else {
        player.loadPlaylist({
          list: WOW_PLAYLIST_ID,
          listType: 'playlist',
          index: Math.floor(Math.random() * 50),
        })
      }
      isPlayingRef.current = true
      setIsPlaying(true)
    } else {
      player.pauseVideo()
      isPlayingRef.current = false
      setIsPlaying(false)
      setTrackTitle(null)
    }
  }, [])

  const setVolume = useCallback((value: number) => {
    setVolumeState(value)
    playerRef.current?.setVolume(value)
  }, [])

  return {
    isPlaying,
    trackTitle,
    volume,
    toggle,
    setVolume,
    containerId: CONTAINER_ID,
  }
}
