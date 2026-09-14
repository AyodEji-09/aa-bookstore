import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { toast } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useActionState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (message?.state === "success") {
      const returnUrl = searchParams.get("return_url")
      if (returnUrl) {
        router.push(returnUrl)
      }
    }
    if (message?.state === "error" && message.error) {
      toast.error(message.error)
    }
  }, [message, searchParams, router])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-2xl sm:text-3xl font-serif font-normal text-center text-gray-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-sm text-gray-600 mb-8 leading-relaxed">
        Sign in to access your digital library, orders, and bookstore benefits.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-6 text-center text-sm text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4"
          data-testid="login-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please verify your email, then sign in.
        </div>
      )}
      <form className="w-full" action={formAction}>
        {searchParams.get("return_url") && (
          <input
            type="hidden"
            name="return_url"
            value={searchParams.get("return_url") || ""}
          />
        )}
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Email address"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.FORGOT_PASSWORD)}
              className="text-xs text-[#980000] hover:underline font-medium"
              data-testid="forgot-password-link"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 h-12 rounded-full bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Sign in
        </SubmitButton>
      </form>

      <div className="text-center text-sm text-gray-600 mt-8">
        Not a member?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline font-semibold text-gray-900 hover:text-[#980000] transition-colors"
          data-testid="register-button"
        >
          Create an account
        </button>
      </div>
    </div>
  )
}

export default Login
