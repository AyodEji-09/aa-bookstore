"use client"

import { useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import { addToCart } from "@lib/data/cart"
import { ChevronLeft, ChevronRight, BookOpen, Minus, Plus, Heart } from "lucide-react"

type ProductShowcaseProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

export default function ProductShowcase({
  product,
  region,
  countryCode,
  images,
}: ProductShowcaseProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const { cheapestPrice } = getProductPrice({ product })
  const firstVariantId = product.variants?.[0]?.id

  // Collect and deduplicate all images from props, product.images, and product.thumbnail
  const candidateImages = [
    ...(images || []),
    ...(product.images || []),
    ...(product.thumbnail ? [{ id: "thumb", url: product.thumbnail }] : []),
  ]

  const displayImages: { id?: string; url: string }[] = []
  const seenUrls = new Set<string>()

  for (const img of candidateImages) {
    if (img && img.url && !seenUrls.has(img.url)) {
      seenUrls.add(img.url)
      displayImages.push({
        id: img.id || img.url,
        url: img.url,
      })
    }
  }

  const currentImage = displayImages[selectedImageIndex] || displayImages[0]

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const handleAddToCart = async () => {
    if (!firstVariantId) return
    setIsAdding(true)
    try {
      await addToCart({
        variantId: firstVariantId,
        quantity,
        countryCode,
      })
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="content-container py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-x-2 text-xs text-gray-500 mb-8 font-medium">
        <LocalizedClientLink href="/" className="hover:text-[#980000] transition-colors">
          Home
        </LocalizedClientLink>
        <span>&gt;</span>
        <LocalizedClientLink href="/store" className="hover:text-[#980000] transition-colors">
          Books
        </LocalizedClientLink>
        <span>&gt;</span>
        <span className="text-[#382C2C] font-semibold truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image Gallery Thumbnails & Main Showcase (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row gap-5 items-start">
          
          {/* Vertical Thumbnails List (Only rendered if product has multiple images) */}
          {displayImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto no-scrollbar flex-shrink-0 w-full sm:w-20">
              {displayImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 rounded-lg border-2 overflow-hidden relative transition-all ${
                    idx === selectedImageIndex
                      ? "border-[#980000] shadow-sm"
                      : "border-red-200 hover:border-red-400 opacity-80"
                  }`}
                >
                  {img.url ? (
                    <Image
                      src={img.url}
                      alt={`${product.title} thumbnail ${idx + 1}`}
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
            <div className="self-start bg-white/95 text-[#382C2C] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-x-2 shadow-md">
              <BookOpen className="w-4 h-4 text-[#980000]" />
              <span>Book Preview</span>
            </div>

            {/* Book Cover Content if no external image */}
            {currentImage?.url ? (
              <Image
                src={currentImage.url}
                alt={product.title}
                fill
                className="object-cover rounded-xl"
                priority
              />
            ) : (
              <div className="my-auto text-center p-8 space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight font-serif text-amber-300 drop-shadow-md">
                  {product.title}
                </h2>
                <p className="text-xs tracking-widest text-gray-300 uppercase font-sans">
                  WRITTEN BY {(product.metadata?.author as string) || "AYODEJI ANIFOWOSE"}
                </p>
              </div>
            )}

            {/* Bottom Right Floating Circular Nav Arrows */}
            {displayImages.length > 1 && (
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

        {/* Right Column: Product Information & Purchase Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Title & Author */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382C2C] tracking-tight leading-tight mb-2">
              {product.title}
            </h1>
            <p className="text-base text-gray-500 font-medium">
              {(product.metadata?.author as string) || product.subtitle || "Ayodeji Anifowose"}
            </p>
          </div>

          {/* Price */}
          <div className="text-2xl font-extrabold text-[#382C2C]">
            {cheapestPrice ? (
              <span>{cheapestPrice.calculated_price}</span>
            ) : (
              <span>$12.49</span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-[#4D4C4C] leading-relaxed">
            {product.description ||
              "Explore this title by Ayodeji Anifowose, crafted to inspire, guide, and enrich your life."}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-x-4 pt-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-[#382C2C] w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#980000] hover:text-[#980000] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart & Favorite Action Buttons */}
          <div className="flex items-center gap-x-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !firstVariantId}
              className="flex-1 py-3 px-8 bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-bold rounded transition-colors shadow-sm disabled:opacity-50"
            >
              {isAdding ? "Adding..." : "Add to cart"}
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex-1 py-3 px-8 border text-sm font-bold rounded transition-colors flex items-center justify-center gap-x-2 ${
                isFavorite
                  ? "border-[#980000] bg-red-50 text-[#980000]"
                  : "border-red-300 text-[#980000] hover:bg-red-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#980000]" : ""}`} />
              <span>Favorite</span>
            </button>
          </div>

          {/* Thin Red Divider & Product Specs Metadata Grid */}
          <div className="border-t border-red-200 pt-6 mt-6 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-red-300 font-semibold block mb-0.5">Author :</span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.author as string) || "Ayodeji Anifowose"}
              </span>
            </div>
            <div>
              <span className="text-red-300 font-semibold block mb-0.5">Publisher :</span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.publisher as string) || "Ayodeji Anifowose Publishing"}
              </span>
            </div>
            <div>
              <span className="text-red-300 font-semibold block mb-0.5">Publication date :</span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.publication_date as string) ||
                  (product.metadata?.publicationDate as string) ||
                  (product.metadata?.year as string) ||
                  "2024"}
              </span>
            </div>
            <div>
              <span className="text-red-300 font-semibold block mb-0.5">Language :</span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.language as string) || "English"}
              </span>
            </div>
            {Boolean(product.metadata?.reading_age || product.metadata?.readingAge) && (
              <div>
                <span className="text-red-300 font-semibold block mb-0.5">Reading age :</span>
                <span className="text-[#382C2C] font-medium">
                  {String(product.metadata?.reading_age || product.metadata?.readingAge)}
                </span>
              </div>
            )}
            {Boolean(product.metadata?.print_length || product.metadata?.pages) && (
              <div>
                <span className="text-red-300 font-semibold block mb-0.5">Print length :</span>
                <span className="text-[#382C2C] font-medium">
                  {String(product.metadata?.print_length || `${product.metadata?.pages} pages`)}
                </span>
              </div>
            )}
            {Boolean(product.metadata?.isbn) && (
              <div>
                <span className="text-red-300 font-semibold block mb-0.5">ISBN :</span>
                <span className="text-[#382C2C] font-medium">
                  {String(product.metadata?.isbn)}
                </span>
              </div>
            )}
            {Boolean(product.metadata?.dimensions) && (
              <div>
                <span className="text-red-300 font-semibold block mb-0.5">Dimensions :</span>
                <span className="text-[#382C2C] font-medium">
                  {String(product.metadata?.dimensions)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
