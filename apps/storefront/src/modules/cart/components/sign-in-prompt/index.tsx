import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-gray-50/60 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 border border-gray-100">
      <div className="min-w-0 flex-1">
        <Heading
          level="h2"
          className="text-sm sm:text-base font-semibold text-gray-900"
        >
          Already have an account?
        </Heading>
        <Text className="text-xs text-gray-500 mt-0.5">
          Sign in for a better experience.
        </Text>
      </div>
      <div className="shrink-0">
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            size="small"
            className="h-9 px-4 text-xs font-semibold rounded-md border-gray-200 hover:bg-white transition-colors shrink-0 whitespace-nowrap"
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
