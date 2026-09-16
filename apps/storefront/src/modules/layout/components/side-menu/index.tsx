"use client"

import { Popover, PopoverPanel, Transition, Portal } from "@headlessui/react"
import Image from "next/image"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"
import { ChevronRight } from "lucide-react"

type CategoryItem = {
  name: string
  handle: string
  hasChildren?: boolean
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: CategoryItem[]
}

const SideMenu = ({ regions, locales, currentLocale, categories = [] }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full flex items-center">
      <Popover className="h-full flex items-center">
        {({ open, close }) => (
          <>
            <Popover.Button
              data-testid="nav-menu-button"
              className="p-2 rounded-full border border-[#F1F1F3] text-[#382C2C] hover:border-[#980000] hover:text-[#980000] transition-colors focus:outline-none"
              title="Open Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Popover.Button>
            <Portal>
            {open && (
              <div
                className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={close}
                data-testid="side-menu-backdrop"
              />
            )}

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <PopoverPanel className="fixed inset-y-0 left-0 z-[81] w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar">
                <div data-testid="nav-menu-popup" className="flex flex-col h-full bg-white w-full overflow-x-hidden overflow-y-auto no-scrollbar">
                  {/* Clean All-White Logo Header (No Wine BG) */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                    <LocalizedClientLink href="/" onClick={close}>
                      <Image
                        src="/images/logo.png"
                        alt="Eric-Emanuel Schmitt Logo"
                        width={140}
                        height={40}
                        className="h-9 w-auto object-contain"
                      />
                    </LocalizedClientLink>
                    <button
                      data-testid="close-menu-button"
                      onClick={close}
                      className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                    >
                      <XMark className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Navigation Links (No Section Title, No Border Bottoms) */}
                  <div className="p-6 flex-1 bg-white">
                    <ul className="flex flex-col gap-y-4">
                      {/* Fixed Home */}
                      <li>
                        <LocalizedClientLink
                          href="/"
                          className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                          onClick={close}
                        >
                          <span>Home</span>
                        </LocalizedClientLink>
                      </li>

                      {/* Fixed All Books */}
                      <li>
                        <LocalizedClientLink
                          href="/store"
                          className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                          onClick={close}
                        >
                          <span>All Books</span>
                        </LocalizedClientLink>
                      </li>

                      {/* Dynamic Categories (Only render '>' if hasChildren is true) */}
                      {categories.map((cat) => (
                        <li key={cat.handle}>
                          <LocalizedClientLink
                            href={`/categories/${cat.handle}`}
                            className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                            onClick={close}
                          >
                            <span>{cat.name}</span>
                            {cat.hasChildren && (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </LocalizedClientLink>
                        </li>
                      ))}

                      {/* Digital Library */}
                      <li>
                        <LocalizedClientLink
                          href="/account/library"
                          className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                          onClick={close}
                        >
                          <span>My Library</span>
                        </LocalizedClientLink>
                      </li>

                      {/* Wishlist */}
                      <li>
                        <LocalizedClientLink
                          href="/account/wishlist"
                          className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                          onClick={close}
                        >
                          <span>Wishlist</span>
                        </LocalizedClientLink>
                      </li>

                      {/* Account */}
                      <li>
                        <LocalizedClientLink
                          href="/account"
                          className="text-base font-semibold text-[#382C2C] hover:text-[#980000] py-1 flex items-center justify-between transition-colors"
                          onClick={close}
                        >
                          <span>Account</span>
                        </LocalizedClientLink>
                      </li>
                    </ul>
                  </div>

                  {/* All-White Sidebar Footer (No Background Color, No Copyright) */}
                  <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-y-4">
                    {!!locales?.length && (
                      <div
                        className="relative w-full flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200"
                        onMouseEnter={languageToggleState.open}
                        onMouseLeave={languageToggleState.close}
                      >
                        <LanguageSelect
                          toggleState={languageToggleState}
                          locales={locales}
                          currentLocale={currentLocale}
                        />
                        <button
                          type="button"
                          onClick={() => languageToggleState.toggle()}
                          className="p-0.5 text-gray-400 hover:text-black focus:outline-none"
                          title="Toggle language options"
                        >
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150 text-gray-400",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </button>
                      </div>
                    )}
                    {regions && (
                      <div
                        className="relative w-full flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        <CountrySelect
                          toggleState={countryToggleState}
                          regions={regions}
                        />
                        <button
                          type="button"
                          onClick={() => countryToggleState.toggle()}
                          className="p-0.5 text-gray-400 hover:text-black focus:outline-none"
                          title="Toggle country options"
                        >
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150 text-gray-400",
                              countryToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </PopoverPanel>
            </Transition>
            </Portal>
          </>
        )}
      </Popover>
    </div>
  )
}

export default SideMenu
