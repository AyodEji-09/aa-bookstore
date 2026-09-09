"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import SearchModal from "@modules/search/components/search-modal"
import { useParams } from "next/navigation"

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { countryCode } = useParams() as { countryCode: string }

  // Global keyboard shortcut listener (Cmd+K / Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
        return
      }

      // Open on '/' if not inside an input/textarea
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      {/* Desktop Search Trigger Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-gray-200/90 hover:border-[#980000] text-gray-500 hover:text-[#382C2C] bg-white transition-all text-xs group shadow-sm w-44 lg:w-52"
        title="Search books (⌘K)"
      >
        <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#980000] transition-colors flex-shrink-0" />
        <span className="truncate flex-1 text-left text-gray-400 group-hover:text-gray-600">
          Search books...
        </span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 rounded border border-gray-200 group-hover:text-gray-600">
          ⌘K
        </kbd>
      </button>

      {/* Mobile Search Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="md:hidden w-9 h-9 rounded-full border border-[#F1F1F3] text-[#382C2C] hover:border-[#980000] hover:text-[#980000] flex items-center justify-center transition-colors"
        title="Search books"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Search Modal */}
      <SearchModal
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        countryCode={countryCode || "us"}
      />
    </>
  )
}
