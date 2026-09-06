import { Suspense } from "react"
import Image from "next/image"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { listCategories } from "@lib/data/categories"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import WishlistButton from "@modules/layout/components/wishlist-button"
import SideMenu from "@modules/layout/components/side-menu"
import CountrySelectNav from "@modules/layout/components/country-select-nav"
import NavPills from "./nav-pills"
import { ArrowUpRightIcon } from "lucide-react"

export default async function Nav() {
  const [regions, locales, currentLocale, productCategories] =
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions),
      listLocales(),
      getLocale(),
      listCategories().catch(() => []),
    ])

  // Filter top-level categories from backend
  const topCategories =
    productCategories?.filter((c) => !c.parent_category) || []

  // Fallback category items if backend DB has no categories yet
  const fallbackCategories = [
    { name: "Novels", handle: "novels" },
    { name: "Audiobooks", handle: "audiobooks" },
    { name: "Plays & Theater", handle: "plays-theater" },
  ]

  const displayCategories =
    topCategories.length > 0
      ? topCategories.map((c) => ({
          name: c.name,
          handle: c.handle,
          hasChildren: (c.category_children?.length || 0) > 0,
        }))
      : fallbackCategories.map((c) => ({ ...c, hasChildren: false }))

  return (
    <>
      {/* Top Announcement Bar (Unfixed: scrolls away naturally with page) */}
      <div className="w-full bg-black text-white text-[13px] font-medium tracking-wide py-3 px-4 text-center flex items-center justify-center gap-x-1.5">
        <span>Subscribe to our Newsletter For Latest Books</span>
        <ArrowUpRightIcon size={18} />
      </div>

      {/* Sticky Navbar Header */}
      <header className="sticky top-0 inset-x-0 z-50 bg-white border-b border-[#F1F1F3]">
        <nav className="content-container flex items-center justify-between h-20 px-4 sm:px-6">
          {/* Logo */}
          <LocalizedClientLink
            href="/"
            className="flex items-center gap-x-2.5 group"
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={160}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </LocalizedClientLink>

          {/* Desktop Navigation Links (Pill Style with Dynamic Active Wine BG) */}
          <NavPills categories={displayCategories} />

          {/* Right Header Actions */}
          <div className="flex items-center gap-x-3">
            {/* Fully Rounded Flag-Only Country Selector */}
            {regions && regions.length > 0 && (
              <div className="hidden sm:block">
                <CountrySelectNav regions={regions} />
              </div>
            )}

            {/* Account Icon */}
            <LocalizedClientLink
              href="/account"
              className="w-9 h-9 rounded-full bg-[#980000] text-white flex items-center justify-center hover:bg-[#7a0000] transition-colors"
              title="Account"
              data-testid="nav-account-link"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </LocalizedClientLink>

            {/* Wishlist Button */}
            <WishlistButton />

            {/* Cart Button */}
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="w-9 h-9 rounded-full border border-[#F1F1F3] text-[#382C2C] flex items-center justify-center relative"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={displayCategories}
              />
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
