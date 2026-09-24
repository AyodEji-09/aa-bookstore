import { Inter } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { CartProvider } from "@lib/context/cart-context"
import { Toaster } from "@medusajs/ui"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const baseURL = getBaseURL()

export const metadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: {
    default: "Ayodeji Anifowose Store",
    template: "%s | Ayodeji Anifowose Store",
  },
  description:
    "Official store of author Ayodeji Anifowose. Discover books, digital editions, audiobooks, and exclusive releases.",
  authors: [{ name: "Ayodeji Anifowose" }],
  creator: "Ayodeji Anifowose",
  publisher: "Ayodeji Anifowose Store",
  keywords: [
    "Ayodeji Anifowose",
    "Ayodeji Anifowose Store",
    "Author",
    "Books",
    "Audiobooks",
    "eBooks",
    "Official Store",
    "Publications",
    "Novels",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseURL,
    siteName: "Ayodeji Anifowose Store",
    title: "Ayodeji Anifowose Store",
    description:
      "Official store of author Ayodeji Anifowose. Discover books, digital editions, audiobooks, and exclusive releases.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Ayodeji Anifowose Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@GFatherGHusband",
    creator: "@GFatherGHusband",
    title: "Ayodeji Anifowose Store",
    description:
      "Official store of author Ayodeji Anifowose. Discover books, digital editions, audiobooks, and exclusive releases.",
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseURL}/#organization`,
        name: "Ayodeji Anifowose Store",
        url: baseURL,
        logo: `${baseURL}/images/logo.png`,
        sameAs: [
          "https://x.com/GFatherGHusband",
          "https://instagram.com/ayodeji.anifowose",
        ],
      },
      {
        "@type": "Person",
        "@id": `${baseURL}/#author`,
        name: "Ayodeji Anifowose",
        jobTitle: "Author",
        sameAs: [
          "https://x.com/GFatherGHusband",
          "https://instagram.com/ayodeji.anifowose",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${baseURL}/#website`,
        url: baseURL,
        name: "Ayodeji Anifowose Store",
        publisher: {
          "@id": `${baseURL}/#organization`,
        },
      },
    ],
  }

  return (
    <html lang="en" data-mode="light" className={`${inter.variable} scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-white`}>
        <CartProvider>
          <WishlistProvider>
            <main className="relative">{props.children}</main>
            <Toaster position="top-right" />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
