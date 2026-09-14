"use client"

import { clx } from "@modules/common/components/ui"
import {
  SelectHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

import ChevronDown from "@modules/common/icons/chevron-down"

type NativeSelectProps = {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">

const CartItemSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    { placeholder = "Select...", className, children, disabled, ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    const [isPlaceholder, setIsPlaceholder] = useState(false)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    useEffect(() => {
      if (innerRef.current && innerRef.current.value === "") {
        setIsPlaceholder(true)
      } else {
        setIsPlaceholder(false)
      }
    }, [innerRef.current?.value])

    return (
      <div
        className={clx(
          "relative flex items-center h-10 w-14 border border-ui-border-base bg-ui-bg-subtle rounded-md transition-colors hover:bg-ui-bg-field-hover",
          {
            "opacity-50 pointer-events-none": disabled,
          },
          className
        )}
      >
        <select
          ref={innerRef}
          disabled={disabled}
          {...props}
          className={clx(
            "appearance-none w-full h-full bg-transparent pl-3 pr-5 text-sm font-medium text-ui-fg-base outline-none cursor-pointer disabled:cursor-not-allowed",
            {
              "text-ui-fg-subtle": isPlaceholder,
            }
          )}
        >
          {isPlaceholder && placeholder && (
            <option disabled value="">
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <span className="absolute right-2 inset-y-0 flex items-center pointer-events-none text-ui-fg-muted">
          <ChevronDown size="12" />
        </span>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
