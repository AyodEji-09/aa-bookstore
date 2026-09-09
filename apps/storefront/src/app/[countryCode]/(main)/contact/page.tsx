import { Metadata } from "next"
import ContactForm from "@modules/contact/components/contact-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Mail, MapPin, Phone, Clock, BookOpen, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us | Ayodeji Anifowose Bookstore",
  description: "Get in touch with the Ayodeji Anifowose Bookstore team for order assistance, digital library support, author events, or general inquiries.",
}

export default async function ContactPage() {
  return (
    <div className="py-12 md:py-16 bg-[#FAF9F6]/50 min-h-screen">
      <div className="content-container max-w-5xl">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-[#980000]/10 text-[#980000] text-[11px] font-extrabold uppercase tracking-widest mb-3">
            Support & Inquiries
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#382C2C] tracking-tight mb-4">
            We are Here to Help
          </h1>
          <p className="text-sm text-[#4D4C4C] leading-relaxed">
            Have a question about an order, need assistance with your eBook or Audiobook, or wish to inquire about author events? Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Contact Details & FAQs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Cards */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-[#382C2C] uppercase tracking-wider border-b border-gray-100 pb-3">
                Customer Care
              </h3>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Support Email</div>
                  <a
                    href="mailto:support@ayodejianifowose.com"
                    className="text-xs font-bold text-[#382C2C] hover:text-[#980000] transition-colors"
                  >
                    support@ayodejianifowose.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Telephone</div>
                  <span className="text-xs font-bold text-[#382C2C]">
                    +495 27 590 000
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Publishing & Office</div>
                  <span className="text-xs font-bold text-[#382C2C]">
                    Schloss-Karl-Str 12, Munich
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#980000] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Hours & Response</div>
                  <span className="text-xs font-bold text-[#382C2C]">
                    Mon – Fri, 9:00 AM – 6:00 PM CET
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Digital Library Link Banner */}
            <div className="bg-[#980000] rounded-2xl p-6 text-white shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <BookOpen className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <h4 className="text-sm font-bold">Looking for your Digital Books?</h4>
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                If you recently bought an eBook or Audiobook, your titles are already active and waiting in your personal reader.
              </p>
              <LocalizedClientLink
                href="/account/library"
                className="inline-block px-4 py-2 bg-white text-[#980000] font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
              >
                Open My Library &rarr;
              </LocalizedClientLink>
            </div>

            {/* Common FAQ snippet */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#382C2C] uppercase tracking-wider border-b border-gray-100 pb-3">
                <HelpCircle className="w-4 h-4 text-[#980000]" />
                <span>Common Questions</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <strong className="block text-[#382C2C] mb-1">When do physical books ship?</strong>
                  <p className="text-gray-500 leading-relaxed">
                    Orders are packed and dispatched within 24 to 48 business hours. Tracking is emailed upon carrier pickup.
                  </p>
                </div>
                <div>
                  <strong className="block text-[#382C2C] mb-1">Can I download or read on my phone?</strong>
                  <p className="text-gray-500 leading-relaxed">
                    Yes! Our interactive eBook reader and Audiobook player are fully responsive on iPhone, Android, tablets, and laptops.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-[#382C2C] mb-1">
                Send Us a Message
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Fill out the form below and we will respond to your inquiry promptly.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
