"use client"

import Accordion from "@modules/products/components/product-tabs/accordion"
import { HttpTypes } from "@medusajs/types"

type ProductInfoAccordionProps = {
  product: HttpTypes.StoreProduct
}

const STANDARD_METADATA_KEYS = new Set([
  "author",
  "publisher",
  "publication_date",
  "publicationDate",
  "year",
  "language",
  "reading_age",
  "readingAge",
  "print_length",
  "pages",
  "isbn",
  "dimensions",
  "narrator",
  "duration",
  "media_key",
  "file_url",
  "is_digital",
  "format",
])

const formatKey = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ProductInfoAccordion({
  product,
}: ProductInfoAccordionProps) {
  const metadata = (product.metadata || {}) as Record<string, unknown>

  const customEntries = Object.entries(metadata).filter(
    ([key, val]) =>
      !STANDARD_METADATA_KEYS.has(key) &&
      val !== null &&
      val !== undefined &&
      typeof val !== "object" &&
      String(val).trim() !== ""
  )

  const author = (metadata.author as string) || product.subtitle || "-"
  const publisher = (metadata.publisher as string) || "-"
  const publicationDate =
    (metadata.publication_date as string) ||
    (metadata.publicationDate as string) ||
    (metadata.year as string) ||
    "-"
  const language = (metadata.language as string) || "-"
  const readingAge =
    metadata.reading_age || metadata.readingAge
      ? String(metadata.reading_age || metadata.readingAge)
      : "-"
  const printLength =
    metadata.print_length || metadata.pages
      ? String(metadata.print_length || `${metadata.pages} pages`)
      : "-"
  const isbn = metadata.isbn ? String(metadata.isbn) : "-"
  const dimensions = metadata.dimensions ? String(metadata.dimensions) : "-"
  const narrator = metadata.narrator ? String(metadata.narrator) : null
  const duration = metadata.duration ? String(metadata.duration) : null

  return (
    <div className="mt-6">
      <Accordion type="single" collapsible>
        <Accordion.Item
          title="Product Information"
          value="product-info"
          headingSize="medium"
          className="border-y !border-[#980000]"
          titleClassName="font-bold !text-[#382C2C] text-sm tracking-wide"
        >
          <div className="pt-2 pb-4 grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Author :
              </span>
              <span className="text-[#382C2C] font-medium">{author}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Publisher :
              </span>
              <span className="text-[#382C2C] font-medium">{publisher}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Publication date :
              </span>
              <span className="text-[#382C2C] font-medium">
                {publicationDate}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Language :
              </span>
              <span className="text-[#382C2C] font-medium">{language}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Reading age :
              </span>
              <span className="text-[#382C2C] font-medium">{readingAge}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Print length :
              </span>
              <span className="text-[#382C2C] font-medium">{printLength}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                ISBN :
              </span>
              <span className="text-[#382C2C] font-medium">{isbn}</span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Dimensions :
              </span>
              <span className="text-[#382C2C] font-medium">{dimensions}</span>
            </div>

            {narrator && (
              <div>
                <span className="text-[#980000] font-semibold block mb-0.5">
                  Narrator :
                </span>
                <span className="text-[#382C2C] font-medium">{narrator}</span>
              </div>
            )}

            {duration && (
              <div>
                <span className="text-[#980000] font-semibold block mb-0.5">
                  Audio duration :
                </span>
                <span className="text-[#382C2C] font-medium">{duration}</span>
              </div>
            )}

            {customEntries.map(([k, v]) => (
              <div key={k}>
                <span className="text-[#980000] font-semibold block mb-0.5">
                  {formatKey(k)} :
                </span>
                <span className="text-[#382C2C] font-medium">
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}
