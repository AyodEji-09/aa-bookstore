import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "../localized-client-link"
import clsx from "clsx"

type InteractiveLinkProps = {
  href: string
  children?: React.ReactNode
  onClick?: () => void
  className?: string
}

const InteractiveLink = ({
  href,
  children,
  onClick,
  className,
  ...props
}: InteractiveLinkProps) => {
  return (
    <LocalizedClientLink
      className={clsx(
        "flex gap-x-1 items-center group",
        className || "text-ui-fg-interactive"
      )}
      href={href}
      onClick={onClick}
      {...props}
    >
      <Text className="text-inherit">{children}</Text>
      <ArrowUpRightMini
        className="group-hover:rotate-45 ease-in-out duration-150 text-inherit"
        color="currentColor"
      />
    </LocalizedClientLink>
  )
}

export default InteractiveLink

