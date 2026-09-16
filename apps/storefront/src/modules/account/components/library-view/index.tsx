"use client"

import { useState } from "react"
import Image from "next/image"
import {
  BookOpen,
  Headphones,
  ArrowRight,
} from "lucide-react"
import { clx } from "@modules/common/components/ui"
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
    <div className="w-full" data-testid="digital-library-view">
      {/* Page Header matching other dashboard pages */}
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Digital Library</h1>
        <p className="text-base-regular">
          Access and enjoy your purchased eBooks and audiobooks online. Read chapters or stream audiobooks anytime directly from your account.
        </p>
      </div>

      {/* Format Filter Tabs */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={clx(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
              activeTab === "all"
                ? "bg-[#980000] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ebook")}
            className={clx(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5",
              activeTab === "ebook"
                ? "bg-[#980000] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>eBooks ({ebookCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audiobook")}
            className={clx(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5",
              activeTab === "audiobook"
                ? "bg-[#980000] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Audiobooks ({audiobookCount})</span>
          </button>
        </div>
      )}

      {/* Book Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6">
          {filteredItems.map((item) => {
            const isAudio = item.format === "audiobook"
            const isLoading = loadingItemId === item.id
            const lastChapter = item.progress?.last_chapter || 1

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between h-full bg-white"
              >
                <div>
                  {/* Book Cover Image */}
                  <div
                    onClick={() => handleOpenBook(item)}
                    className="block relative overflow-hidden rounded-lg mb-2.5 sm:mb-3 cursor-pointer"
                  >
                    <div className="aspect-[3/4] w-full relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
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
                            <Headphones className="w-10 h-10 stroke-[1.5]" />
                          ) : (
                            <BookOpen className="w-10 h-10 stroke-[1.5]" />
                          )}
                        </div>
                      )}

                      {/* Format Pill Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[10px] font-bold text-[#382C2C] flex items-center gap-1 shadow-sm">
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
                  </div>

                  {/* Title & Author */}
                  <div className="space-y-0.5 mb-2">
                    <h3
                      onClick={() => handleOpenBook(item)}
                      className="font-bold text-sm sm:text-base text-[#382C2C] group-hover:text-[#980000] transition-colors line-clamp-1 cursor-pointer"
                    >
                      {item.product?.title || "Digital Edition"}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {item.product?.author || "Ayodeji Anifowose"}
                    </p>
                  </div>

                  {/* Progress Status */}
                  <div className="flex items-center justify-between text-[11px] text-gray-500 my-1.5">
                    <span>
                      {isAudio ? "Track" : "Chapter"} {lastChapter}
                    </span>
                    <span className="font-semibold text-gray-600">
                      {item.progress?.completed ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>

                {/* Button - rounded like the others */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenBook(item)}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 bg-[#980000] hover:bg-[#7a0000] active:scale-[0.99] text-white text-xs font-bold rounded-md flex items-center justify-center gap-x-1.5 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : isAudio ? (
                      <>
                        <Headphones className="w-3.5 h-3.5 shrink-0" />
                        <span>Listen Now</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
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
        <div className="border border-dashed border-gray-200 rounded-lg p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#980000] flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 stroke-[1.75]" />
          </div>
          <h3 className="text-base-semi text-[#382C2C]">
            Your digital library is currently empty
          </h3>
          <p className="text-small-regular text-gray-500 mt-2 max-w-sm leading-relaxed">
            When you purchase an eBook or Audiobook from our catalog, it will appear here permanently for instant online reading and listening.
          </p>
          <LocalizedClientLink
            href="/store"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#980000] hover:bg-[#7a0000] text-white text-xs font-bold transition-colors"
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
      {activeAccess && activeAccess.item.format === "ebook" && (
        <EbookReader
          itemId={activeAccess.item.id}
          title={activeAccess.item.product.title}
          author={activeAccess.item.product.author}
          documentType={activeAccess.item.document_type}
          hasDocument={activeAccess.item.has_document}
          chapters={activeAccess.item.chapters}
          initialChapter={activeAccess.item.progress?.last_chapter || 1}
          onClose={() => setActiveAccess(null)}
        />
      )}
    </div>
  )
}
