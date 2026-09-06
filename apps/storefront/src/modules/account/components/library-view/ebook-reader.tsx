"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  Sun,
  Moon,
  Bookmark,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { EbookChapter, updateLibraryProgress } from "@lib/data/library"

type EbookReaderProps = {
  itemId: string
  title: string
  author: string
  documentType?: "pdf" | "epub" | "chapters"
  hasDocument?: boolean
  chapters?: EbookChapter[]
  initialChapter?: number
  onClose: () => void
}

type ReaderTheme = "white" | "sepia" | "night"

export default function EbookReader({
  itemId,
  title,
  author,
  documentType = "pdf",
  hasDocument = true,
  chapters = [],
  initialChapter = 1,
  onClose,
}: EbookReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderTaskRef = useRef<any>(null)

  const isPdf = Boolean(
    documentType === "pdf" ||
      hasDocument ||
      (!chapters || chapters.length <= 1)
  )

  // State
  const [theme, setTheme] = useState<ReaderTheme>("sepia")
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base")
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Non-PDF Chapter State
  const [currentChapterIndex, setCurrentChapterIndex] = useState(
    Math.max(0, Math.min(Math.max(0, (chapters?.length || 1) - 1), initialChapter - 1))
  )

  // PDF Viewer State
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(Math.max(1, initialChapter))
  const [zoomScale, setZoomScale] = useState<number>(1.2)
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(isPdf)
  const [isPageRendering, setIsPageRendering] = useState<boolean>(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Prevent download and print shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault()
      }
      if (e.key === "ArrowLeft") {
        if (isPdf && currentPage > 1) {
          goToPdfPage(currentPage - 1)
        } else if (!isPdf && currentChapterIndex > 0) {
          goToChapter(currentChapterIndex - 1)
        }
      } else if (e.key === "ArrowRight") {
        if (isPdf && currentPage < totalPages) {
          goToPdfPage(currentPage + 1)
        } else if (!isPdf && currentChapterIndex < chapters.length - 1) {
          goToChapter(currentChapterIndex + 1)
        }
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    window.addEventListener("keydown", handleKeyDown)
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [isPdf, currentPage, totalPages, currentChapterIndex, chapters.length])

  // PDF.js Loader
  useEffect(() => {
    if (!isPdf) return
    let isMounted = true

    const initPdf = async () => {
      setIsPdfLoading(true)
      setPdfError(null)

      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load PDF engine"))
            document.head.appendChild(script)
          })
        }

        const pdfjs = (window as any).pdfjsLib
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"

        // Use streaming proxy endpoint with fallback to fileUrl
        const docUrl = `/api/library/${itemId}/document`
        const loadingTask = pdfjs.getDocument({
          url: docUrl,
          withCredentials: true,
        })

        loadingTask.onPassword = () => {
          throw new Error("Password protected documents are not supported")
        }

        const doc = await loadingTask.promise
        if (!isMounted) return

        setPdfDoc(doc)
        setTotalPages(doc.numPages)
        const startPage = Math.max(1, Math.min(initialChapter || 1, doc.numPages))
        setCurrentPage(startPage)
      } catch (err: any) {
        if (isMounted) {
          console.error("PDF load error:", err)
          setPdfError(err?.message || "Failed to load digital book.")
        }
      } finally {
        if (isMounted) {
          setIsPdfLoading(false)
        }
      }
    }

    initPdf()
    return () => {
      isMounted = false
    }
  }, [isPdf, itemId, initialChapter])

  // PDF Page Renderer to Canvas
  const renderPdfPage = useCallback(
    async (pageNumber: number, scale: number) => {
      if (!pdfDoc || !canvasRef.current) return

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel()
      }

      setIsPageRendering(true)

      try {
        const page = await pdfDoc.getPage(pageNumber)
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        const renderTask = page.render(renderContext)
        renderTaskRef.current = renderTask

        await renderTask.promise
        renderTaskRef.current = null
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Canvas render error:", err)
        }
      } finally {
        setIsPageRendering(false)
      }
    },
    [pdfDoc]
  )

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPdfPage(currentPage, zoomScale)
    }
  }, [pdfDoc, currentPage, zoomScale, renderPdfPage])

  // Page Navigation Handlers
  const goToPdfPage = (pageNum: number) => {
    if (!pdfDoc || pageNum < 1 || pageNum > totalPages) return
    setCurrentPage(pageNum)
    // Save progress to backend
    updateLibraryProgress(itemId, {
      last_chapter: pageNum,
      completed: pageNum === totalPages,
    })
  }

  const goToChapter = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index)
      updateLibraryProgress(itemId, {
        last_chapter: index + 1,
        completed: index === chapters.length - 1,
      })
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // Theme Styles
  const themeClasses: Record<ReaderTheme, { container: string; header: string; text: string; canvasFilter: string }> = {
    white: {
      container: "bg-[#F3F4F6] text-[#242424]",
      header: "bg-white/95 border-b border-gray-200 text-[#382C2C]",
      text: "text-gray-800",
      canvasFilter: "shadow-2xl",
    },
    sepia: {
      container: "bg-[#FBF0D9] text-[#4A3B2C]",
      header: "bg-[#F4E7CE]/95 border-b border-[#E2D2B5] text-[#382C2C]",
      text: "text-[#3D3023]",
      canvasFilter: "sepia-[0.35] contrast-[0.96] brightness-[0.98] shadow-2xl",
    },
    night: {
      container: "bg-[#161414] text-[#E0DCDC]",
      header: "bg-[#1E1B1B]/95 border-b border-white/10 text-white",
      text: "text-[#CFCACA]",
      canvasFilter: "invert-[0.9] hue-rotate-180 brightness-[0.95] shadow-2xl",
    },
  }

  const fontSizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-loose",
    lg: "text-lg leading-loose",
    xl: "text-xl leading-loose",
  }

  const currentChapter = (chapters && chapters[currentChapterIndex]) || chapters?.[0]
  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none ${themeClasses[theme].container}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Anti-print protection */}
      <style>{`
        @media print {
          body, html, * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      {/* Top Header Controls Bar */}
      <header
        className={`flex items-center justify-between px-4 sm:px-6 py-3 backdrop-blur-sm sticky top-0 z-10 transition-colors ${themeClasses[theme].header}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <BookOpen className="w-5 h-5 text-[#980000] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight truncate max-w-[200px] sm:max-w-md">
              {title}
            </h2>
            <p className="text-[11px] opacity-70 font-medium truncate">{author}</p>
          </div>
        </div>

        {/* Center: Reading Progress Badge */}
        {isPdf && totalPages > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-semibold">
            <span>Page {currentPage} of {totalPages}</span>
            <span className="opacity-40">•</span>
            <span className="text-[#980000]">{progressPercent}% read</span>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Zoom Controls (PDF only) */}
          {isPdf && (
            <div className="hidden sm:flex items-center gap-0.5 bg-black/5 dark:bg-white/5 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.7, prev - 0.15))}
                disabled={zoomScale <= 0.7}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1.2)}
                className="px-1.5 py-1 text-[11px] font-mono font-semibold rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3 inline mr-1" />
                {Math.round((zoomScale / 1.2) * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(2.5, prev + 0.15))}
                disabled={zoomScale >= 2.5}
                className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Font Size Selector (Non-PDF Text only) */}
          {!isPdf && (
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
          )}

          {/* Theme Selector */}
          <div className="flex items-center gap-0.5 bg-black/5 dark:bg-white/5 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setTheme("white")}
              className={`p-1.5 rounded transition-colors ${
                theme === "white" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="White theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("sepia")}
              className={`p-1.5 rounded transition-colors ${
                theme === "sepia" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="Sepia theme"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("night")}
              className={`p-1.5 rounded transition-colors ${
                theme === "night" ? "bg-[#980000] text-white" : "opacity-70 hover:opacity-100"
              }`}
              title="Night theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Reader */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors ml-1"
            title="Close reader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Book Reader Canvas / PDF Viewer or Text Layout */}
      {isPdf ? (
        <main className="flex-1 w-full h-full relative flex flex-col overflow-hidden">
          {isPdfLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#980000]" />
              <p className="text-xs font-semibold opacity-70">Loading secure digital book...</p>
            </div>
          ) : pdfError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2">
              <p className="text-sm font-semibold text-[#980000]">{pdfError}</p>
              <p className="text-xs opacity-70">Please check your network connection or try again later.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto flex flex-col items-center py-6 px-4">
              <div className="relative flex justify-center max-w-full">
                <canvas
                  ref={canvasRef}
                  className={`rounded border border-black/10 transition-all duration-150 ${themeClasses[theme].canvasFilter}`}
                  style={{ userSelect: "none" }}
                />
                {isPageRendering && (
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation Bar for PDF */}
          {!isPdfLoading && !pdfError && totalPages > 0 && (
            <footer
              className={`flex items-center justify-between px-6 py-2.5 backdrop-blur-sm border-t transition-colors ${themeClasses[theme].header}`}
            >
              <button
                type="button"
                onClick={() => goToPdfPage(currentPage - 1)}
                disabled={currentPage <= 1 || isPageRendering}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:border-[#980000] hover:text-[#980000] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium opacity-80">
                  {currentPage} / {totalPages}
                </span>
                <span className="text-[11px] font-semibold text-[#980000] hidden sm:inline">
                  ({progressPercent}%)
                </span>
              </div>

              <button
                type="button"
                onClick={() => goToPdfPage(currentPage + 1)}
                disabled={currentPage >= totalPages || isPageRendering}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-xs font-bold hover:border-[#980000] hover:text-[#980000] transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </footer>
          )}
        </main>
      ) : currentChapter ? (
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
              {currentChapter.content?.map((paragraph, idx) => (
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
      ) : (
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm font-medium text-ui-fg-muted">
            No readable content available.
          </p>
        </main>
      )}
    </div>
  )
}
