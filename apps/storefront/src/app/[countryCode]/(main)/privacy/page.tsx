import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Privacy Policy | Ayodeji Anifowose Store",
  description:
    "Read the privacy policy of Ayodeji Anifowose Store, detailing how we protect your personal data, payments, and account information.",
}

export default async function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-16 bg-white min-h-screen">
      <div className="content-container max-w-3xl">
        <div className="mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#980000]">
            Legal & Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#382C2C] mt-2 mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-[#4D4C4C] space-y-8 leading-relaxed text-xs sm:text-sm">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">1. Overview</h2>
            <p>
              Ayodeji Anifowose Store (“we,” “our,” or “us”) respects your privacy and is dedicated to safeguarding your personal data. This Privacy Policy describes the types of information we collect when you visit our website, purchase physical products or digital titles, or interact with our digital reader and audiobook streaming player.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">2. Information We Collect</h2>
            <p>We only collect information necessary to fulfill your orders and provide account features:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Contact and Account Data:</strong> First name, last name, email address, and encrypted password credentials.</li>
              <li><strong>Order & Shipping Data:</strong> Delivery addresses, selected book formats, order history, and fulfillment tracking numbers.</li>
              <li><strong>Digital Entitlements:</strong> Record of purchased eBooks and Audiobooks linked to your account to grant lifetime access to our digital library.</li>
              <li><strong>Device & Interaction Data:</strong> Basic technical logs, browser type, and reading/audio progress saved for your reading convenience.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">3. Payment Information Security</h2>
            <p>
              All payment transactions are processed through certified, PCI-DSS Level 1 compliant payment gateways (including Stripe). <strong>We never process, store, or have access to your full credit card numbers or banking passwords.</strong> Payments are tokenized securely between your browser and the payment provider.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">4. How We Use Your Data</h2>
            <p>Your data is used strictly for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Processing, billing, packing, and dispatching your book orders.</li>
              <li>Delivering automated transactional emails (such as order confirmations with digital access links, password resets, and shipping tracking).</li>
              <li>Maintaining your digital library streaming access.</li>
              <li>Sending occasional author newsletters and new book release announcements if you opt in.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">5. Third-Party Services</h2>
            <p>
              We do not sell, rent, or trade your personal data. We only share necessary data with trusted service providers who adhere to strict data protection regulations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Resend:</strong> For transactional email delivery and newsletter dispatches.</li>
              <li><strong>Cloudflare / Amazon Web Services:</strong> For fast, encrypted digital media hosting and asset delivery.</li>
              <li><strong>Shipping Carriers:</strong> For physical book delivery to your designated postal address.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#382C2C]">6. Your Rights</h2>
            <p>
              Under applicable data protection laws (such as GDPR), you have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account and personal information, subject to legal record-keeping requirements.
            </p>
            <p>
              To exercise any of these rights, please reach out through our <LocalizedClientLink href="/contact" className="text-[#980000] font-bold underline">Contact Page</LocalizedClientLink> or email us at <a href="mailto:support@ayodejianifowose.com" className="text-[#980000] font-bold underline">support@ayodejianifowose.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
