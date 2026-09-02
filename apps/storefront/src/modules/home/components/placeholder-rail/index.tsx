"use client"

import { useRef, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import { ChevronLeft, ChevronRight } from "lucide-react"

type BookItem = {
  id: string
  title: string
  author: string
  price: string
  tag: string
}

const SECTION_BOOKS: Record<string, BookItem[]> = {
  "Selected for you": [
    {
      id: "b1",
      title: "Financial Feminist",
      author: "Tori Dunlap",
      price: "$20.46",
      tag: "FINANCIAL WISDOM",
    },
    {
      id: "b2",
      title: "No More Police",
      author: "Andrea Ritchie",
      price: "$17.66",
      tag: "ESSAYS & THOUGHTS",
    },
    {
      id: "b3",
      title: "I'm Glad My Mom Died",
      author: "Jennette McCurdy",
      price: "$26.03",
      tag: "MEMOIR & NOVEL",
    },
    {
      id: "b4",
      title: "Nona the Ninth",
      author: "Tamsyn Muir",
      price: "$26.96",
      tag: "FICTION MASTERPIECE",
    },
    {
      id: "b5",
      title: "Oscar and the Lady in Pink",
      author: "Eric-Emanuel Schmitt",
      price: "$24.50",
      tag: "GLOBAL BESTSELLER",
    },
  ],
  "Trending books": [
    {
      id: "b6",
      title: "Harlem Shuffle",
      author: "Colson Whitehead",
      price: "$26.92",
      tag: "RECOMMENDED",
    },
    {
      id: "b7",
      title: "Two Old Women",
      author: "Velma Wallis",
      price: "$13.95",
      tag: "SHORT STORIES",
    },
    {
      id: "b8",
      title: "Carrie Soto Is Back",
      author: "Taylor Jenkins Reid",
      price: "$26.04",
      tag: "SPECIAL EDITION",
    },
    {
      id: "b9",
      title: "Book Lovers",
      author: "Emily Henry",
      price: "$15.81",
      tag: "ROMANCE & NOVEL",
    },
  ],
  "Recently released ebooks": [
    {
      id: "b10",
      title: "The Most Beautiful Book",
      author: "Eric-Emanuel Schmitt",
      price: "$18.50",
      tag: "NEW E-BOOK",
    },
    {
      id: "b11",
      title: "Odysseus from Baghdad",
      author: "Eric-Emanuel Schmitt",
      price: "$21.00",
      tag: "E-BOOK EXCLUSIVE",
    },
    {
      id: "b12",
      title: "The Woman with the Bouquet",
      author: "Eric-Emanuel Schmitt",
      price: "$16.75",
      tag: "NEW RELEASE",
    },
    {
      id: "b13",
      title: "Noah's Child",
      author: "Eric-Emanuel Schmitt",
      price: "$23.40",
      tag: "HISTORICAL FICTION",
    },
  ],
}

const toProduct = (book: BookItem): HttpTypes.StoreProduct => ({
  id: book.id,
  title: book.title,
  handle: book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  subtitle: book.author,
  description: "",
  thumbnail: null,
  images: [],
  collection: { title: book.tag, id: "col_" + book.id, handle: "col" } as any,
  variants: [
    {
      id: "var_" + book.id,
      title: "Default",
      calculated_price: {
        calculated_amount: parseFloat(book.price.replace("$", "")),
        calculated_price: book.price,
        currency_code: "usd",
        price_type: "default",
      } as any,
    } as any,
  ],
})

export default function PlaceholderRail({ title }: { title: string }) {
  const books = SECTION_BOOKS[title] || SECTION_BOOKS["Selected for you"]
  const products = books.map(toProduct)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeDot, setActiveDot] = useState(0)

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.75
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const maxScroll = container.scrollWidth - container.clientWidth
    if (maxScroll <= 0) return
    const percentage = container.scrollLeft / maxScroll
    const dotIndex = Math.min(4, Math.floor(percentage * 5))
    setActiveDot(dotIndex)
  }

  return (
    <div className="content-container py-10 border-b border-gray-100">
      {/* Header with Title and Reverted Top-Right Navigation Buttons */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#382C2C] tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-red-400" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-[#980000] transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Non-wrapping Horizontal Scroll Carousel using ProductPreview */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex flex-nowrap overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[240px] sm:w-[260px] flex-shrink-0 snap-start"
          >
            <ProductPreview product={product} />
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-x-2 mt-6">
        {[0, 1, 2, 3, 4].map((dotIdx) => (
          <span
            key={dotIdx}
            className={`transition-all duration-200 rounded-full ${
              dotIdx === activeDot ? "w-2.5 h-2.5 bg-[#980000]" : "w-2 h-2 bg-red-200"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
