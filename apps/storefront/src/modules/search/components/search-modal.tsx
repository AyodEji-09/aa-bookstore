"use client"

import { Fragment, useState, useEffect, useRef, useCallback } from "react"
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { searchBooks, SearchResultItem, SearchFormat } from "@lib/data/search"
import {
  Search,
  X,
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react"

type SearchModalProps = {
  isOpen: boolean
  closeModal: () => void
  countryCode: string
}

const FORMAT_OPTIONS: { label: string; value: SearchFormat }[] = [
  { label: "All Formats", value: "all" },
  { label: "Audiobooks", value: "audiobook" },
  { label: "eBooks", value: "ebook" },
  { label: "Hardcover", value: "hardcover" },
  { label: "Paperback", value: "paperback" },
]

const POPULAR_SEARCHES = [
  "Audiobooks",
  "Trick or Treat",
  "Ayodeji Anifowose",
  "Novels",
  "eBook Editions",
]

export default function SearchModal({
  isOpen,
  closeModal,
  countryCode,
}: SearchModalProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [selectedFormat, setSelectedFormat] = useState<SearchFormat>("all")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery("")
      setSelectedFormat("all")
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Perform search with debounce
  const fetchResults = useCallback(
    async (q: string, fmt: SearchFormat) => {
      setLoading(true)
      try {
        const data = await searchBooks({
          query: q,
          format: fmt,
          countryCode,
          limit: 15,
        })
        setResults(data)
        setSelectedIndex(0)
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [countryCode]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResults(query, selectedFormat)
    }, 250)

    return () => clearTimeout(timer)
  }, [query, selectedFormat, fetchResults])

  // Handle navigate to book
  const handleSelectBook = (handle: string) => {
    closeModal()
    router.push(`/${countryCode}/products/${handle}`)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelectBook(results[selectedIndex].handle)
      }
    } else if (e.key === "Escape") {
      closeModal()
    }
  }

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto p-2.5 sm:p-6 md:p-14">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-2"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-2"
          >
            <DialogPanel
              className="mx-auto max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-gray-100 flex flex-col max-h-[85vh]"
              onKeyDown={handleKeyDown}
            >
              {/* Top Search Input Bar */}
              <div className="relative flex items-center border-b border-gray-100 px-4 py-3 sm:px-6">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books, authors, categories..."
                  className="w-full bg-transparent px-3.5 py-1 text-sm text-[#382C2C] placeholder-gray-400 focus:outline-none focus:ring-0 font-medium"
                />
                {loading ? (
                  <Loader2 className="w-5 h-5 text-[#980000] animate-spin flex-shrink-0" />
                ) : query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("")
                      inputRef.current?.focus()
                    }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 rounded border border-gray-200">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Format Filter Tabs */}
              <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-[#FAF9F6] border-b border-gray-100 overflow-x-auto no-scrollbar">
                {FORMAT_OPTIONS.map((f) => {
                  const active = selectedFormat === f.value
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setSelectedFormat(f.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        active
                          ? "bg-[#980000] text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-gray-200/70 border border-gray-200/80"
                      }`}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>

              {/* Results Container */}
              <div className="flex-1 overflow-y-auto thin-scrollbar p-2 sm:p-3 space-y-1">
                {/* When Query is Empty and No Results */}
                {!query.trim() && results.length === 0 && !loading && (
                  <div className="py-4 px-2">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4 text-[#980000]" />
                      <span>Popular Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setQuery(term)
                            inputRef.current?.focus()
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] hover:bg-gray-100 text-xs font-medium text-[#382C2C] border border-gray-200/70 transition-colors flex items-center gap-1.5"
                        >
                          <Search className="w-3 h-3 text-gray-400" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl p-4 bg-[#FAF9F6] border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Looking to explore the complete catalog?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          closeModal()
                          router.push(`/${countryCode}/store`)
                        }}
                        className="font-bold text-[#980000] hover:underline flex items-center gap-1 shrink-0"
                      >
                        Browse All Books <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* No Matches Found State */}
                {query.trim() && results.length === 0 && !loading && (
                  <div className="py-12 text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-[#382C2C] mb-1">
                      No books found for &ldquo;{query}&rdquo;
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
                      We couldn&apos;t find any titles matching your query. Try
                      searching by author, topic, or browse all available titles.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        closeModal()
                        router.push(`/${countryCode}/store`)
                      }}
                      className="px-4 py-2 bg-[#980000] text-white text-xs font-bold rounded-xl hover:bg-[#800000] transition-colors"
                    >
                      View All Books in Catalog
                    </button>
                  </div>
                )}

                {/* Results List */}
                {results.map((book, index) => {
                  const isHighlighted = selectedIndex === index

                  return (
                    <div
                      key={book.id}
                      onClick={() => handleSelectBook(book.handle)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all ${
                        isHighlighted
                          ? "bg-[#FAF9F6] ring-1 ring-[#980000]/20"
                          : "hover:bg-gray-50/90 active:bg-gray-100"
                      }`}
                    >
                      {/* Book Cover Thumbnail */}
                      <div className="relative w-11 h-16 sm:w-12 sm:h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-gray-200/60">
                        {book.thumbnail ? (
                          <Image
                            src={book.thumbnail}
                            alt={book.title}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Book Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#980000] transition-colors">
                            {book.title}
                          </h4>
                          {book.price ? (
                            <span className="text-xs sm:text-sm font-bold text-gray-900 shrink-0 group-hover:text-[#980000] transition-colors">
                              {book.price.calculatedPrice}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 shrink-0">
                              Available
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 truncate">
                            By{" "}
                            <span className="text-gray-700 font-medium">
                              {book.author}
                            </span>
                            {book.categories?.[0] && (
                              <span className="text-gray-400">
                                {" "}
                                &bull; {book.categories[0]}
                              </span>
                            )}
                          </p>
                          {book.price?.originalPrice && (
                            <span className="text-[11px] text-gray-400 line-through shrink-0">
                              {book.price.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#980000] group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" />
                    </div>
                  )
                })}
              </div>

              {/* Modal Footer with Keyboard Shortcuts */}
              <div className="px-4 py-2.5 bg-[#FAF9F6] border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <div className="hidden sm:flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
                      ↓
                    </kbd>
                    <span>navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
                      ↵
                    </kbd>
                    <span>select</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
                      esc
                    </kbd>
                    <span>close</span>
                  </span>
                </div>
                <div className="text-gray-400 text-xs w-full sm:w-auto text-center sm:text-right">
                  {results.length > 0
                    ? `${results.length} book${
                        results.length === 1 ? "" : "s"
                      } found`
                    : "Search Ayollc Bookstore"}
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
