import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Truck, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping & Returns Policy | Ayodeji Anifowose Store",
  description:
    "Learn about our shipping options for physical orders, instant digital delivery for eBooks and audiobooks, and our guarantee policy.",
}

export default async function ShippingReturnsPage() {
  return (
    <div className="py-12 md:py-16 bg-white min-h-screen">
      <div className="content-container max-w-3xl">
        <div className="mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#980000]">
            Fulfillment & Guarantees
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#382C2C] mt-2 mb-3">
            Shipping & Returns Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#382C2C]">Instant Digital Delivery</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                eBooks and Audiobooks are available immediately in your library upon checkout.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#382C2C]">Fast Physical Dispatch</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">
                Hardcover and Paperback orders ship within 24 to 48 business hours with tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-[#4D4C4C] space-y-8 leading-relaxed text-xs sm:text-sm">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">1. Digital Editions Delivery</h2>
            <p>
              When you purchase an eBook or Audiobook, no physical package is dispatched and no shipping fee is charged. Your digital license is granted instantaneously. You can access your titles immediately by navigating to your <LocalizedClientLink href="/account/library" className="text-[#980000] font-bold underline">Digital Library</LocalizedClientLink>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">2. Physical Editions Shipping</h2>
            <p>
              We ship physical books worldwide using reputable postal and courier carriers. Standard processing takes 1 to 2 business days prior to dispatch.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Domestic Delivery:</strong> 2 to 5 business days post-dispatch.</li>
              <li><strong>International Delivery:</strong> 7 to 14 business days depending on destination and local customs processing.</li>
              <li><strong>Tracking:</strong> You will receive an automated email confirmation with your carrier tracking number as soon as your parcel is labeled and collected.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">3. Physical Book Returns & Replacements</h2>
            <p>
              We take pride in packaging physical books securely. If your book arrives damaged, misprinted, or defective, we will happily send a replacement copy or provide a full refund within <strong>30 days of delivery</strong>.
            </p>
            <p>
              To initiate a replacement, please contact our support team at <LocalizedClientLink href="/contact" className="text-[#980000] font-bold underline">Contact Us</LocalizedClientLink> with your order number and a clear photograph of the damage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">4. Digital Products Refund Policy</h2>
            <p>
              Due to the immediate access nature of digital goods (eBooks and streamed audiobooks), sales of digital products are generally final once the content has been accessed. However, if you experience technical difficulties or purchased a duplicate format by mistake, reach out within 14 days and our support team will resolve it.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
