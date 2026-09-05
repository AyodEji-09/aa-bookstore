"use client"

import { useState } from "react"
import Image from "next/image"
import {
  BookOpen,
  Headphones,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  LibraryItem,
  LibraryAccessPayload,
  getLibraryItemAccess,
} from "@lib/data/library"
import AudiobookPlayer from "./audiobook-player"
import EbookReader from "./ebook-reader"

type LibraryViewProps = {
  items: LibraryItem[]
}

export default function LibraryView({ items }: LibraryViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "ebook" | "audiobook">("all")
  const [activeAccess, setActiveAccess] = useState<LibraryAccessPayload | null>(null)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  const filteredItems = items.filter((item) => {
    if (activeTab === "all") return true
    return item.format === activeTab
  })

  const ebookCount = items.filter((i) => i.format === "ebook").length
  const audiobookCount = items.filter((i) => i.format === "audiobook").length

  const handleOpenBook = async (item: LibraryItem) => {
    setLoadingItemId(item.id)
    try {
      const accessPayload = await getLibraryItemAccess(item.id)
      if (accessPayload) {
        setActiveAccess(accessPayload)
      }
    } catch (err) {
      console.error("Failed to load digital content", err)
    } finally {
      setLoadingItemId(null)
    }
  }

  return (
    <div className="w-full space-y-8" data-testid="digital-library-view">
      {/* Library Title & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#980000]" />
            <h1 className="text-2xl font-extrabold text-[#382C2C] tracking-tight">
              My Digital Library
            </h1>
          </div>
          <p className="text-xs text-[#4D4C4C] mt-1">
            Read your eBooks and stream your audiobooks directly in your browser.
          </p>
        </div>

        {/* Format Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white text-[#382C2C] shadow-sm"
                : "text-gray-500 hover:text-[#382C2C]"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ebook")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ebook"
                ? "bg-white text-[#382C2C] shadow-sm"
                : "text-gray-500 hover:text-[#382C2C]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#980000]" />
            <span>eBooks ({ebookCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audiobook")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "audiobook"
                ? "bg-white text-[#382C2C] shadow-sm"
                : "text-gray-500 hover:text-[#382C2C]"
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-[#980000]" />
            <span>Audiobooks ({audiobookCount})</span>
          </button>
        </div>
      </div>

      {/* Book Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isAudio = item.format === "audiobook"
            const isLoading = loadingItemId === item.id
            const lastChapter = item.progress?.last_chapter || 1

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover and Format Badge */}
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 mb-4">
                    {item.product?.thumbnail ? (
                      <Image
                        src={item.product.thumbnail}
                        alt={item.product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        {isAudio ? (
                          <Headphones className="w-12 h-12 stroke-[1.5]" />
                        ) : (
                          <BookOpen className="w-12 h-12 stroke-[1.5]" />
                        )}
                      </div>
                    )}

                    {/* Format Pill Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-[#382C2C]">
                      {isAudio ? (
                        <>
                          <Headphones className="w-3 h-3 text-[#980000]" />
                          <span>Audiobook</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3 text-[#980000]" />
                          <span>eBook</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#980000]">
                      {item.product?.category || "Literature"}
                    </p>
                    <h3 className="text-sm font-bold text-[#382C2C] line-clamp-1 group-hover:text-[#980000] transition-colors">
                      {item.product?.title || "Digital Edition"}
                    </h3>
                    <p className="text-xs text-[#4D4C4C] font-medium line-clamp-1">
                      {item.product?.author || "Eric-Emmanuel Schmitt"}
                    </p>
                  </div>
                </div>

                {/* Progress and Action Button */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#4D4C4C]">
                    <span>
                      {isAudio ? "Track" : "Chapter"} {lastChapter}
                    </span>
                    <span className="font-semibold text-gray-500">
                      {item.progress?.completed ? "Completed" : "In Progress"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenBook(item)}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : isAudio ? (
                      <>
                        <Headphones className="w-4 h-4" />
                        <span>Listen Now</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4" />
                        <span>Read Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50/70 border border-dashed border-gray-200 rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#980000] flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h3 className="text-base font-bold text-[#382C2C]">
            Your digital library is currently empty
          </h3>
          <p className="text-xs text-[#4D4C4C] mt-2 max-w-sm leading-relaxed">
            When you purchase an eBook or Audiobook from our catalog, it will appear here permanently for instant online reading and listening.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>Explore Book Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>
      )}

      {/* Active Audiobook Player Modal */}
      {activeAccess && activeAccess.item.format === "audiobook" && activeAccess.item.tracks && (
        <AudiobookPlayer
          itemId={activeAccess.item.id}
          title={activeAccess.item.product.title}
          author={activeAccess.item.product.author}
          thumbnail={activeAccess.item.product.thumbnail}
          tracks={activeAccess.item.tracks}
          initialTrackIndex={Math.max(0, (activeAccess.item.progress?.last_chapter || 1) - 1)}
          initialTimestamp={activeAccess.item.progress?.timestamp_seconds || 0}
          onClose={() => setActiveAccess(null)}
        />
      )}

      {/* Active eBook Reader Modal */}
      {activeAccess && activeAccess.item.format === "ebook" && activeAccess.item.chapters && (
        <EbookReader
          itemId={activeAccess.item.id}
          title={activeAccess.item.product.title}
          author={activeAccess.item.product.author}
          chapters={activeAccess.item.chapters}
          initialChapter={activeAccess.item.progress?.last_chapter || 1}
          onClose={() => setActiveAccess(null)}
        />
      )}
    </div>
  )
}
