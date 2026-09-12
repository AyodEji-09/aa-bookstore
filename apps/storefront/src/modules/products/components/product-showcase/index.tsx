"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import ProductGallery, { DisplayImage } from "./product-gallery"
import ProductFormats from "./product-formats"
import ProductPurchase from "./product-purchase"
import ProductInfoAccordion from "./product-info-accordion"

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
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(product.variants?.[0]?.id)

  const { cheapestPrice } = getProductPrice({ product })
  const selectedVariantPrice = selectedVariantId
    ? getProductPrice({ product, variantId: selectedVariantId }).variantPrice ||
      cheapestPrice
    : cheapestPrice

  // Candidate images: ensure thumbnail is strictly first (index 0), then any other images
  const displayImages: DisplayImage[] = []
  const seenUrls = new Set<string>()

  if (product.thumbnail) {
    displayImages.push({ id: "thumb", url: product.thumbnail })
    seenUrls.add(product.thumbnail)
  }

  const candidateImages = [...(images || []), ...(product.images || [])]

  for (const img of candidateImages) {
    if (img && img.url && !seenUrls.has(img.url)) {
      seenUrls.add(img.url)
      displayImages.push({
        id: img.id || img.url,
        url: img.url,
      })
    }
  }

  const handleSelectVariant = (variant: HttpTypes.StoreProductVariant) => {
    setSelectedVariantId(variant.id)
    if (variant.images?.length) {
      const varImgUrl = variant.images[0].url
      const imgIdx = displayImages.findIndex((img) => img.url === varImgUrl)
      if (imgIdx !== -1) setSelectedImageIndex(imgIdx)
    }
  }

  const author =
    (product.metadata?.author as string) ||
    product.subtitle ||
    "Ayodeji Anifowose"

  return (
    <div className="content-container py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-x-2 text-xs text-gray-500 mb-8 font-medium">
        <LocalizedClientLink
          href="/"
          className="hover:text-[#980000] transition-colors"
        >
          Home
        </LocalizedClientLink>
        <span>&gt;</span>
        <LocalizedClientLink
          href="/store"
          className="hover:text-[#980000] transition-colors"
        >
          Books
        </LocalizedClientLink>
        <span>&gt;</span>
        <span className="text-[#382C2C] font-semibold truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main Product Showcase Section (5:6 ratio on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-10 items-start">
        {/* Left Column: Image Gallery Thumbnails & Main Showcase (5 Cols) */}
        <ProductGallery
          images={displayImages}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
          productTitle={product.title}
          author={author}
          className="lg:col-span-5"
        />

        {/* Right Column: Product Information & Purchase Actions (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Title & Author */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382C2C] tracking-tight leading-tight mb-2">
              {product.title}
            </h1>
            <p className="text-base text-gray-500 font-medium">
              {author}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-[#4D4C4C] leading-relaxed">
            {product.description ||
              "Explore this title by Ayodeji Anifowose, crafted to inspire, guide, and enrich your life."}
          </p>

          {/* Formats / Variants Selector */}
          <ProductFormats
            variants={product.variants || []}
            selectedVariantId={selectedVariantId}
            onSelectVariant={handleSelectVariant}
          />

          {/* Price & Purchase Actions */}
          <ProductPurchase
            product={product}
            selectedVariantId={selectedVariantId}
            countryCode={countryCode}
            selectedVariantPrice={selectedVariantPrice}
          />

          {/* Product Information Accordion */}
          <ProductInfoAccordion product={product} />
        </div>
      </div>
    </div>
  )
}
