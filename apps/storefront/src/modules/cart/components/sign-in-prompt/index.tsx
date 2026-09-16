import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-gray-50/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border border-gray-100">
      <div>
        <Heading level="h2" className="text-sm sm:text-base font-semibold text-gray-900">
          Already have an account?
        </Heading>
        <Text className="text-xs text-gray-500 mt-0.5">
          Sign in for a faster checkout and digital library access.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" size="small" className="h-9 px-4 text-xs font-semibold shrink-0" data-testid="sign-in-button">
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
