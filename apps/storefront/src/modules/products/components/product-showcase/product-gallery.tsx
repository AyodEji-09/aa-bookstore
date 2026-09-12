"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react"

export type DisplayImage = {
  id?: string
  url: string
}

type ProductGalleryProps = {
  images: DisplayImage[]
  selectedImageIndex: number
  onSelectImage: (index: number) => void
  productTitle: string
  author: string
  className?: string
}

export default function ProductGallery({
  images,
  selectedImageIndex,
  onSelectImage,
  productTitle,
  author,
  className,
}: ProductGalleryProps) {
  const currentImage = images[selectedImageIndex] || images[0]

  const handlePrevImage = () => {
    onSelectImage(
      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
    )
  }

  const handleNextImage = () => {
    onSelectImage(
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row gap-3 items-start w-full ${
        className || "lg:col-span-5"
      }`}
    >
      {/* Vertical Thumbnails List: Hidden on mobile (< sm), visible on sm+ */}
      {images.length > 1 && (
        <div className="hidden sm:flex sm:flex-col gap-3 overflow-y-auto no-scrollbar flex-shrink-0 sm:w-20">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => onSelectImage(idx)}
              className={`w-20 h-24 rounded-lg border-2 overflow-hidden relative transition-all ${
                idx === selectedImageIndex
                  ? "border-[#980000] shadow-sm"
                  : "border-gray-200 hover:border-[#980000]/60 opacity-80"
              }`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={`${productTitle} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px]">
                  Book Cover
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Book Cover Display */}
      <div className="flex-1 w-full bg-slate-900 rounded-xl overflow-hidden shadow-xl relative min-h-[440px] sm:min-h-[520px] flex flex-col justify-between p-6 text-white border border-gray-100">
        {/* Top Overlay Pill Badge */}
        <div className="self-start bg-white/95 text-[#382C2C] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-x-2 shadow-md z-10">
          <BookOpen className="w-4 h-4 text-[#980000]" />
          <span>Book Preview</span>
        </div>

        {/* Book Cover Content */}
        {currentImage?.url ? (
          <Image
            src={currentImage.url}
            alt={productTitle}
            fill
            className="object-cover rounded-xl"
            priority
          />
        ) : (
          <div className="my-auto text-center p-8 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight font-serif text-amber-300 drop-shadow-md">
              {productTitle}
            </h2>
            <p className="text-xs tracking-widest text-gray-300 uppercase font-sans">
              WRITTEN BY {author}
            </p>
          </div>
        )}

        {/* Bottom Right Floating Circular Nav Arrows */}
        {images.length > 1 && (
          <div className="absolute bottom-5 right-5 flex items-center gap-x-2 z-10">
            <button
              onClick={handlePrevImage}
              className="w-8 h-8 rounded-full bg-[#980000] text-white flex items-center justify-center hover:bg-[#7a0000] transition-colors shadow-md"
              title="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="w-8 h-8 rounded-full bg-[#980000] text-white flex items-center justify-center hover:bg-[#7a0000] transition-colors shadow-md"
              title="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
