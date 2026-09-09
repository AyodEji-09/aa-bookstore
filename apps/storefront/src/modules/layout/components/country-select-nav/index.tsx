"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectNavProps = {
  regions: HttpTypes.StoreRegion[]
  variant?: "default" | "topbar"
}

const CountrySelectNav = ({ regions, variant = "default" }: CountrySelectNavProps) => {
  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1] || ""

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: c.display_name ?? "",
        }))
      })
      .flat()
      .filter((o): o is CountryOption => !!o)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [regions])

  const initialOption = useMemo(() => {
    if (!options || options.length === 0) return null
    return options.find((o) => o.country === countryCode) || options[0] || null
  }, [options, countryCode])

  const [current, setCurrent] = useState<CountryOption | null>(initialOption)

  useEffect(() => {
    if (countryCode && options?.length) {
      const option = options.find((o) => o.country === countryCode)
      if (option) {
        setCurrent(option)
      }
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption | null) => {
    if (!option) return
    setCurrent(option)
    updateRegion(option.country, currentPath)
  }

  if (!options || options.length === 0) {
    return null
  }

  return (
    <div className="relative z-[70]">
      <Listbox value={current} onChange={handleChange}>
        {variant === "topbar" ? (
          <ListboxButton
            className="h-6 px-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-1.5 transition-colors focus:outline-none text-[11px]"
            title={`Shipping to ${current?.label || "Select Country"}`}
          >
            {current && (
              <ReactCountryFlag
                svg
                style={{
                  width: "15px",
                  height: "11px",
                  borderRadius: "2px",
                  objectFit: "cover",
                }}
                countryCode={current.country ?? ""}
              />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">
              {current?.country || "US"}
            </span>
          </ListboxButton>
        ) : (
          <ListboxButton
            className="w-9 h-9 rounded-full border border-[#F1F1F3] bg-white flex items-center justify-center hover:border-gray-300 transition-colors focus:outline-none overflow-hidden"
            title={`Shipping to ${current?.label || "Select Country"}`}
          >
            {current ? (
              <ReactCountryFlag
                svg
                style={{
                  width: "20px",
                  height: "15px",
                  borderRadius: "2px",
                  objectFit: "cover",
                }}
                countryCode={current.country ?? ""}
              />
            ) : (
              <span className="text-xs uppercase font-bold text-gray-500">
                US
              </span>
            )}
          </ListboxButton>
        )}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute right-0 mt-2 max-h-60 w-44 overflow-auto thin-scrollbar rounded-xl bg-white py-1.5 text-xs shadow-xl ring-1 ring-black/5 z-[80] focus:outline-none">
            {options.map((o, index) => (
              <ListboxOption
                key={index}
                value={o}
                className={({ focus, selected }) =>
                  `relative cursor-pointer select-none py-2 px-3 flex items-center gap-x-2.5 ${
                    focus || selected
                      ? "bg-red-50 text-[#980000] font-semibold"
                      : "text-gray-700"
                  }`
                }
              >
                <ReactCountryFlag
                  svg
                  style={{
                    width: "18px",
                    height: "13px",
                    borderRadius: "2px",
                    objectFit: "cover",
                  }}
                  countryCode={o.country ?? ""}
                />
                <span className="truncate">{o.label}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  )
}

export default CountrySelectNav
