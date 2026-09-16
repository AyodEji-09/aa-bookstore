import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
      <div className="space-y-1">
        <Heading level="h2" className="text-base sm:text-lg font-semibold text-ui-fg-base tracking-tight">
          Already have an account?
        </Heading>
        <Text className="text-xs sm:text-sm text-ui-fg-subtle">
          Sign in for faster checkout and instant access to your digital bookshelf.
        </Text>
      </div>
      <div className="shrink-0">
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            size="small"
            className="h-9 px-4 text-xs font-semibold rounded-md border-ui-border-base hover:bg-ui-bg-subtle transition-colors"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
