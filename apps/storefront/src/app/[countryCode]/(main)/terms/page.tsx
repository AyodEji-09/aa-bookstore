import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Terms of Service | Ayodeji Anifowose Bookstore",
  description: "Read the terms of service for purchasing physical books, eBooks, and audiobooks at Ayodeji Anifowose Bookstore.",
}

export default async function TermsPage() {
  return (
    <div className="py-12 md:py-16 bg-white min-h-screen">
      <div className="content-container max-w-3xl">
        <div className="mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#980000]">
            Legal & Conditions
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#382C2C] mt-2 mb-3">
            Terms of Service
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-[#4D4C4C] space-y-8 leading-relaxed text-xs sm:text-sm">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">1. Agreement to Terms</h2>
            <p>
              By accessing our website, creating an account, or purchasing any physical or digital editions from Ayodeji Anifowose Bookstore, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">2. Digital Content Licenses & Permitted Use</h2>
            <p>
              When you purchase an eBook or Audiobook from our bookstore, you are granted a non-exclusive, non-transferable, revocable license to access, stream, and read the content strictly for personal, non-commercial use.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You may not reproduce, redistribute, broadcast, sell, rent, lend, or create derivative works from the digital files.</li>
              <li>Circumventing digital rights protections, media stream tokens, or downloading unauthorized copies is strictly prohibited.</li>
              <li>Access to digital content is linked to your registered customer account.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">3. Intellectual Property Rights</h2>
            <p>
              All book titles, written content, audio recordings, cover illustrations, typography, logos, and digital designs are the exclusive intellectual property of author Ayodeji Anifowose and protected by international copyright laws. All rights not expressly granted are reserved.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">4. Physical Book Orders & Fulfillment</h2>
            <p>
              Orders for print editions (Hardcover and Paperback) are subject to product availability. We strive to provide accurate shipping estimates and tracking information. Risk of loss and title for physical books pass to you upon delivery to the carrier.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">5. Account Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately if you suspect unauthorized access to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">6. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Continued use of our bookstore after modifications constitute acceptance of the updated terms.
            </p>
            <p>
              Questions regarding these terms may be directed to our support team at <LocalizedClientLink href="/contact" className="text-[#980000] font-bold underline">Contact Us</LocalizedClientLink>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
