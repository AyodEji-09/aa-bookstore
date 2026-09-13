import { Text, clx } from "@modules/common/components/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Plus } from "lucide-react"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  titleClassName?: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  titleClassName,
  subtitle,
  description,
  children,
  className,
  headingSize: _headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable: _triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "border-gray-200 group border-t last:mb-0 last:border-b",
        className
      )}
    >
      <AccordionPrimitive.Header className="px-0">
        <AccordionPrimitive.Trigger className="flex w-full items-center justify-between py-3.5 text-left group">
          <div className="flex flex-col">
            <span
              className={clx(
                "text-[#382C2C] font-bold text-sm tracking-tight",
                titleClassName
              )}
            >
              {title}
            </span>
            {subtitle && (
              <span className="mt-1 text-xs text-gray-500">{subtitle}</span>
            )}
          </div>
          {customTrigger || <MorphingTrigger />}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none px-0"
        )}
      >
        <div className="inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="w-6 h-6 rounded-full border border-gray-200 group-hover:border-[#980000] text-gray-400 group-hover:text-[#980000] flex items-center justify-center transition-colors flex-shrink-0">
      <Plus className="w-3.5 h-3.5 stroke-[2] transition-transform duration-200 group-radix-state-open:rotate-45" />
    </div>
  )
}

export default Accordion
