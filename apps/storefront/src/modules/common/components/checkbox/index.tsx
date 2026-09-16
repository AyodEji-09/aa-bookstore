import { Checkbox, Label } from "@modules/common/components/ui"
import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  return (
    <div className="flex items-center space-x-2 cursor-pointer" onClick={onChange}>
      <Checkbox
        className="text-base-regular flex items-center gap-x-2 accent-[#980000] cursor-pointer"
        id="checkbox"
        role="checkbox"
        checked={checked}
        readOnly
        aria-checked={checked}
        name={name}
        data-testid={dataTestId}
      />
      <Label
        htmlFor="checkbox"
        className="!transform-none !txt-medium cursor-pointer"
      >
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
