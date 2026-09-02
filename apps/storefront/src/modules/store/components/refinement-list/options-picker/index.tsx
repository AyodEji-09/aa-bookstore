"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, Check } from "lucide-react"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

type OptionsPickerProps = {
  selectedValueIds: string[]
  setOptionValueIds: (valueIds: string[]) => void
}

const OptionsPicker = ({
  selectedValueIds,
  setOptionValueIds,
}: OptionsPickerProps) => {
  const [options, setOptions] = useState<HttpTypes.StoreProductOption[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await sdk.client.fetch<{
          product_options?: HttpTypes.StoreProductOption[]
        }>("/store/product-options", {
          method: "GET",
          query: {
            is_exclusive: false,
            fields: "*values",
          },
        })

        if (response?.product_options) {
          setOptions(response.product_options)
        }
      } catch (error) {
        console.error("Failed to fetch product options", error)
      }
    }

    fetchOptions()
  }, [])

  useEffect(() => {
    if (options.length) {
      setOpenItems(options.map((option) => option.id))
    }
  }, [options])

  if (!options.length) {
    return null
  }

  return (
    <Accordion.Root
      type="multiple"
      value={openItems}
      onValueChange={(values) => setOpenItems(values as string[])}
      className="flex flex-col gap-y-5 pt-3 border-t border-gray-100"
    >
      {options.map((option) => {
        const values =
          option.values
            ?.map((value) => ({
              id: value.id,
              label: value.value,
            }))
            .filter(
              (value): value is { id: string; label: string } =>
                !!value.id && !!value.label
            ) || []

        if (!values.length) {
          return null
        }

        const toggleValue = (valueId: string) => {
          const isSelected = selectedValueIds.includes(valueId)
          const nextSelections = isSelected
            ? selectedValueIds.filter((id) => id !== valueId)
            : [...selectedValueIds, valueId]

          setOptionValueIds(Array.from(new Set(nextSelections)))
        }

        const isOpen = openItems.includes(option.id)
        const selectedCount = values.filter((v) => selectedValueIds.includes(v.id)).length

        return (
          <Accordion.Item
            key={option.id}
            value={option.id}
            className="overflow-hidden space-y-2.5"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between py-0.5 text-left group">
                <div className="flex items-center gap-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#382C2C]">
                    {option.title || "Option"}
                  </span>
                  {selectedCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-red-100 text-[#980000] text-[10px] font-bold flex items-center justify-center">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#382C2C] transition-colors" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#382C2C] transition-colors" />
                )}
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="space-y-1.5 pt-1">
              {values.map((value) => {
                const isSelected = selectedValueIds.includes(value.id)

                return (
                  <button
                    key={value.id}
                    type="button"
                    onClick={() => toggleValue(value.id)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-red-50/80 text-[#980000] font-bold"
                        : "text-[#4D4C4C] hover:bg-gray-50 hover:text-[#382C2C] font-medium"
                    }`}
                  >
                    <span>{value.label}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#980000] border-[#980000] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </Accordion.Content>
          </Accordion.Item>
        )
      })}
    </Accordion.Root>
  )
}

export default OptionsPicker
