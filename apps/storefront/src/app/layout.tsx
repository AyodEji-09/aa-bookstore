import { Inter } from "next/font/google"
import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { WishlistProvider } from "@lib/context/wishlist-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={inter.variable}>
      <body className={inter.className}>
        <WishlistProvider>
          <main className="relative">{props.children}</main>
        </WishlistProvider>
      </body>
    </html>
  )
}
