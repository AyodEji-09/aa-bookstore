"use client"

import { useActionState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { toast } from "@medusajs/ui"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
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
      data-testid="register-page"
    >
      <h1 className="text-2xl sm:text-3xl font-serif font-normal text-center text-gray-900 mb-2">
        Become a Member
      </h1>
      <p className="text-center text-sm text-gray-600 mb-8 leading-relaxed">
        Create your Member profile, and get access to an enhanced shopping
        experience.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-sm text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-lg p-4"
          data-testid="register-verification-message"
        >
          We sent a verification link to <strong>{message.email}</strong>.
          Please check your inbox to verify your email, then sign in.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        {searchParams.get("return_url") && (
          <input
            type="hidden"
            name="return_url"
            value={searchParams.get("return_url") || ""}
          />
        )}
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email address"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <SubmitButton
          className="w-full mt-6 h-12 rounded-full bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-semibold transition-colors shadow-sm"
          data-testid="register-button"
        >
          Join
        </SubmitButton>

        <p className="text-center text-xs text-gray-500 mt-5 leading-relaxed">
          By creating an account, you agree to our{" "}
          <LocalizedClientLink
            href="/terms"
            className="underline font-medium text-gray-700 hover:text-black"
          >
            Terms of Use
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/privacy"
            className="underline font-medium text-gray-700 hover:text-black"
          >
            Privacy Policy
          </LocalizedClientLink>
          .
        </p>
      </form>

      <div className="text-center text-sm text-gray-600 mt-8">
        Already a member?{" "}
        <button
          type="button"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline font-semibold text-gray-900 hover:text-[#980000] transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

export default Register
