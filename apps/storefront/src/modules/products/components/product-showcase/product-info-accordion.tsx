"use client"

import Accordion from "@modules/products/components/product-tabs/accordion"
import { HttpTypes } from "@medusajs/types"

type ProductInfoAccordionProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductInfoAccordion({
  product,
}: ProductInfoAccordionProps) {
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
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.author as string) || "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Publisher :
              </span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.publisher as string) || "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Publication date :
              </span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.publication_date as string) ||
                  (product.metadata?.publicationDate as string) ||
                  (product.metadata?.year as string) ||
                  "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Language :
              </span>
              <span className="text-[#382C2C] font-medium">
                {(product.metadata?.language as string) || "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Reading age :
              </span>
              <span className="text-[#382C2C] font-medium">
                {product.metadata?.reading_age || product.metadata?.readingAge
                  ? String(
                      product.metadata?.reading_age ||
                        product.metadata?.readingAge
                    )
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Print length :
              </span>
              <span className="text-[#382C2C] font-medium">
                {product.metadata?.print_length || product.metadata?.pages
                  ? String(
                      product.metadata?.print_length ||
                        `${product.metadata?.pages} pages`
                    )
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                ISBN :
              </span>
              <span className="text-[#382C2C] font-medium">
                {product.metadata?.isbn ? String(product.metadata?.isbn) : "-"}
              </span>
            </div>
            <div>
              <span className="text-[#980000] font-semibold block mb-0.5">
                Dimensions :
              </span>
              <span className="text-[#382C2C] font-medium">
                {product.metadata?.dimensions
                  ? String(product.metadata?.dimensions)
                  : "-"}
              </span>
            </div>
          </div>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}
