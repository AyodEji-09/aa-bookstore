"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ListMusic,
  Headphones,
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
  const [currentTime, setCurrentTime] = useState(initialTimestamp)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [showChapters, setShowChapters] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentTrack = tracks[currentTrackIndex] || tracks[0]

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
      if (initialTimestamp > 0 && currentTime === initialTimestamp) {
        audioRef.current.currentTime = initialTimestamp
      }
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      // Save progress on pause
      updateLibraryProgress(itemId, {
        last_chapter: currentTrackIndex + 1,
        timestamp_seconds: Math.floor(currentTime),
      })
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error)
    }
  }

  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return
    const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
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
    setCurrentTrackIndex(index)
    setCurrentTime(0)
    setIsPlaying(true)
    setShowChapters(false)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-[#1A1818] text-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
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

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Cover Art */}
          <div className="w-40 h-52 relative rounded-lg overflow-hidden shadow-2xl mb-5 bg-[#2A2626] border border-white/10">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Headphones className="w-12 h-12 mb-2 stroke-[1.5]" />
                <span className="text-xs font-semibold">Audiobook</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-1 font-medium">{author}</p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-gray-300">
            {currentTrack?.title}
          </div>

          {/* Hidden Audio Stream Element */}
          <audio
            ref={audioRef}
            src={currentTrack?.streamUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
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
          <div className="w-full mt-6 space-y-1.5">
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

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-6 w-full">
            {/* Speed Control */}
            <button
              type="button"
              onClick={toggleSpeed}
              className="px-2.5 py-1 text-xs font-bold rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Playback speed"
            >
              {SPEED_OPTIONS[speedIndex]}x
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

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-[#980000] hover:bg-[#800000] text-white flex items-center justify-center shadow-lg transition-transform transform active:scale-95"
            >
              {isPlaying ? (
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

            {/* Chapter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowChapters(!showChapters)}
              className={`p-2 rounded-md transition-colors ${
                showChapters ? "text-[#980000] bg-white/10" : "text-gray-300 hover:text-white"
              }`}
              title="Chapter list"
            >
              <ListMusic className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary bar: Mute toggle & DRM note */}
          <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-white/10 text-xs text-gray-400">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
              Protected Stream
            </span>
          </div>
        </div>

        {/* Chapters Drawer */}
        {showChapters && (
          <div className="border-t border-white/10 bg-[#141212] p-4 max-h-56 overflow-y-auto space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 text-left">
              Track List
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
                  <span className="text-[10px] text-gray-500 font-mono w-4">{idx + 1}</span>
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
