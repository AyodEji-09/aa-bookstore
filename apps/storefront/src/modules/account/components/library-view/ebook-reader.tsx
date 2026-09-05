"use client"

import { useState } from "react"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Type,
  Sun,
  Moon,
  Bookmark,
} from "lucide-react"
import { EbookChapter, updateLibraryProgress } from "@lib/data/library"

type EbookReaderProps = {
  itemId: string
  title: string
  author: string
  chapters: EbookChapter[]
  initialChapter?: number
  onClose: () => void
}

type ReaderTheme = "white" | "sepia" | "night"

export default function EbookReader({
  itemId,
  title,
  author,
  chapters,
  initialChapter = 1,
  onClose,
}: EbookReaderProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(
    Math.max(0, Math.min(chapters.length - 1, initialChapter - 1))
  )
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base")
  const [theme, setTheme] = useState<ReaderTheme>("sepia")

  const currentChapter = chapters[currentChapterIndex] || chapters[0]

  const goToChapter = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index)
      // Save progress to backend
      updateLibraryProgress(itemId, {
        last_chapter: index + 1,
        completed: index === chapters.length - 1,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Theme styles
  const themeClasses: Record<ReaderTheme, { container: string; header: string; text: string }> = {
    white: {
      container: "bg-[#FAFAFA] text-[#242424]",
      header: "bg-white/90 border-b border-gray-200 text-[#382C2C]",
      text: "text-gray-800",
    },
    sepia: {
      container: "bg-[#FBF0D9] text-[#4A3B2C]",
      header: "bg-[#F4E7CE]/90 border-b border-[#E2D2B5] text-[#382C2C]",
      text: "text-[#3D3023]",
    },
    night: {
      container: "bg-[#161414] text-[#E0DCDC]",
      header: "bg-[#1E1B1B]/90 border-b border-white/10 text-white",
      text: "text-[#CFCACA]",
    },
  }

  const fontSizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-loose",
    lg: "text-lg leading-loose",
    xl: "text-xl leading-loose",
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none ${themeClasses[theme].container}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Top Header Controls Bar */}
      <header
        className={`flex items-center justify-between px-6 py-3.5 backdrop-blur-sm sticky top-0 z-10 transition-colors ${themeClasses[theme].header}`}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#980000]" />
          <div>
            <h2 className="text-sm font-bold tracking-tight line-clamp-1">{title}</h2>
            <p className="text-[11px] opacity-70 font-medium">{author}</p>
          </div>
        </div>

        {/* Toolbar: Font Size, Theme, Close */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFontSize("sm")}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                fontSize === "sm" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize("base")}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                fontSize === "base" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("lg")}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                fontSize === "lg" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
            >
              A+
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTheme("white")}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                theme === "white" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                theme === "sepia" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="Sepia theme"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("night")}
              className={`px-2 py-1 text-xs font-semibold rounded ${
                theme === "night" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="Night theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Close Reader */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Book Reader Canvas / Text Layout */}
      <main className="flex-1 overflow-y-auto px-6 py-12 flex justify-center">
        <article className="max-w-2xl w-full">
          {/* Chapter Heading */}
          <div className="text-center pb-8 mb-8 border-b border-black/10 dark:border-white/10">
            <span className="text-xs uppercase tracking-widest font-bold text-[#980000]">
              Chapter {currentChapterIndex + 1} of {chapters.length}
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold mt-2 tracking-tight">
              {currentChapter.title}
            </h1>
          </div>

          {/* Chapter Paragraphs */}
          <div className={`space-y-6 font-serif ${fontSizeClasses[fontSize]} ${themeClasses[theme].text}`}>
            {currentChapter.content.map((paragraph, idx) => (
              <p key={idx} className="indent-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Chapter Bottom Navigation */}
          <div className="flex items-center justify-between pt-12 mt-12 border-t border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => goToChapter(currentChapterIndex - 1)}
              disabled={currentChapterIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all ${
                currentChapterIndex === 0
                  ? "opacity-30 cursor-not-allowed border-transparent"
                  : "border-black/10 dark:border-white/10 hover:border-[#980000] hover:text-[#980000]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono font-medium opacity-60">
              {currentChapterIndex + 1} / {chapters.length}
            </span>

            <button
              type="button"
              onClick={() => goToChapter(currentChapterIndex + 1)}
              disabled={currentChapterIndex === chapters.length - 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all ${
                currentChapterIndex === chapters.length - 1
                  ? "opacity-30 cursor-not-allowed border-transparent"
                  : "border-black/10 dark:border-white/10 hover:border-[#980000] hover:text-[#980000]"
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>
    </div>
  )
}
