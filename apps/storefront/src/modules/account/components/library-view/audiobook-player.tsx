"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Headphones,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { AudiobookTrack, updateLibraryProgress } from "@lib/data/library"

type AudiobookPlayerProps = {
  itemId: string
  title: string
  author: string
  thumbnail?: string
  tracks: AudiobookTrack[]
  initialTrackIndex?: number
  initialTimestamp?: number
  onClose: () => void
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2]

export default function AudiobookPlayer({
  itemId,
  title,
  author,
  thumbnail,
  tracks,
  initialTrackIndex = 0,
  initialTimestamp = 0,
  onClose,
}: AudiobookPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(initialTimestamp)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrack = tracks[currentTrackIndex] || tracks[0]

  // Use same-origin audio proxy if available, with fallback to direct track streamUrl
  const audioSource = `/api/library/${itemId}/audio?track=${currentTrackIndex}`

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[speedIndex]
    }
  }, [speedIndex])

  // Sync time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
      setAudioError(null)
      if (initialTimestamp > 0 && currentTime === initialTimestamp) {
        audioRef.current.currentTime = initialTimestamp
      }
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    setAudioError(null)

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      // Save progress on pause
      updateLibraryProgress(itemId, {
        last_chapter: currentTrackIndex + 1,
        timestamp_seconds: Math.floor(currentTime),
      })
    } else {
      setIsLoading(true)
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Audio playback error:", err)
          setIsLoading(false)
          setIsPlaying(false)
          setAudioError(
            "Unable to play audio. Please ensure an audio file is uploaded for this book."
          )
        })
    }
  }

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return
    const nextTime = Math.max(
      0,
      Math.min(duration, audioRef.current.currentTime + seconds)
    )
    audioRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleSpeed = () => {
    setSpeedIndex((prev) => (prev + 1) % SPEED_OPTIONS.length)
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const selectTrack = (index: number) => {
    if (index < 0 || index >= tracks.length) return
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setAudioError(null)
    setIsPlaying(true)
    setShowChapters(false)
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-[#1A1818] text-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#980000]">
            <Headphones className="w-4 h-4 text-[#980000]" />
            <span>Audiobook Player</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body (ensures controls are NEVER cut off) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 flex flex-col items-center text-center min-h-0">
          {/* Cover Art */}
          <div className="w-28 h-36 sm:w-36 sm:h-48 relative rounded-lg overflow-hidden shadow-2xl mb-4 bg-[#2A2626] border border-white/10 shrink-0">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Headphones className="w-10 h-10 mb-2 stroke-[1.5]" />
                <span className="text-xs font-semibold">Audiobook</span>
              </div>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{author}</p>
          <div className="mt-1.5 inline-block px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300">
            {currentTrack?.title || "Track 1"}
          </div>

          {/* Error Message */}
          {audioError && (
            <div className="w-full mt-3 p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{audioError}</span>
            </div>
          )}

          {/* Hidden Audio Stream Element */}
          <audio
            ref={audioRef}
            src={audioSource}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setIsPlaying(false)
              if (
                currentTrack?.streamUrl &&
                audioRef.current?.src !== currentTrack.streamUrl
              ) {
                if (audioRef.current) {
                  audioRef.current.src = currentTrack.streamUrl
                }
              } else {
                setAudioError(
                  "Unable to play audio. Please ensure an audio file is uploaded for this book."
                )
              }
            }}
            onEnded={() => {
              if (currentTrackIndex < tracks.length - 1) {
                selectTrack(currentTrackIndex + 1)
              } else {
                setIsPlaying(false)
              }
            }}
            autoPlay={isPlaying}
          />

          {/* Scrub Bar */}
          <div className="w-full mt-5 space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#980000]"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Bar - Always Fully Visible */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mt-5 w-full">
            {/* Speed Control */}
            <button
              type="button"
              onClick={toggleSpeed}
              className="px-2 py-1 text-xs font-bold rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Playback speed"
            >
              {SPEED_OPTIONS[speedIndex]}x
            </button>

            {/* Previous Track */}
            <button
              type="button"
              onClick={() => selectTrack(currentTrackIndex - 1)}
              disabled={currentTrackIndex <= 0}
              className="p-2 text-gray-300 hover:text-white disabled:opacity-20 transition-colors"
              title="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* 15s Back */}
            <button
              type="button"
              onClick={() => skipSeconds(-15)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Skip 15s backward"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Play/Pause Main Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#980000] hover:bg-[#800000] text-white flex items-center justify-center shadow-lg transition-transform transform active:scale-95 shrink-0"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current ml-0.5" />
              )}
            </button>

            {/* 15s Forward */}
            <button
              type="button"
              onClick={() => skipSeconds(15)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              title="Skip 15s forward"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Next Track */}
            <button
              type="button"
              onClick={() => selectTrack(currentTrackIndex + 1)}
              disabled={currentTrackIndex >= tracks.length - 1}
              className="p-2 text-gray-300 hover:text-white disabled:opacity-20 transition-colors"
              title="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Chapter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowChapters(!showChapters)}
              className={`p-2 rounded-md transition-colors ${
                showChapters
                  ? "text-[#980000] bg-white/10"
                  : "text-gray-300 hover:text-white"
              }`}
              title="Track list"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary bar: Mute toggle & DRM note */}
          <div className="flex items-center justify-between w-full mt-5 pt-3.5 border-t border-white/10 text-xs text-gray-400">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Protected Stream
            </span>
          </div>
        </div>

        {/* Chapters Drawer */}
        {showChapters && (
          <div className="border-t border-white/10 bg-[#141212] p-4 max-h-52 overflow-y-auto space-y-1 shrink-0">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left">
              Track List ({tracks.length})
            </div>
            {tracks.map((track, idx) => (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(idx)}
                className={`flex items-center justify-between w-full p-2.5 rounded-lg text-xs text-left transition-colors ${
                  idx === currentTrackIndex
                    ? "bg-[#980000]/20 text-red-400 font-bold"
                    : "text-gray-300 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-[10px] text-gray-500 font-mono w-4">
                    {idx + 1}
                  </span>
                  <span className="truncate">{track.title}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                  {formatTime(track.duration)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
