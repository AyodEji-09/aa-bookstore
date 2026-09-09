"use client"

import { useState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui"
import { requestPasswordReset } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

export default function ForgotPassword({ setCurrentView }: Props) {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubmitting(true)
    setError(null)

    const res = await requestPasswordReset(email)
    setSubmitting(false)

    if (res.success) {
      setSubmitted(true)
    } else {
      setError(res.error)
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-large-semi uppercase mb-2">Reset Password</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Enter your email address and we will send you a secure link to reset your password.
      </p>

      {submitted && (
        <div className="w-full mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs leading-relaxed font-medium">
          If an account exists for <strong>{email}</strong>, a password reset email has been sent. Please check your inbox and spam folder.
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="forgot-password-email-input"
          />
        </div>

        <ErrorMessage error={error} data-testid="forgot-password-error" />

        <Button
          type="submit"
          isLoading={submitting}
          className="w-full mt-6 bg-[#980000] hover:bg-[#800000] text-white"
          data-testid="send-reset-link-button"
        >
          {submitted ? "Resend reset link" : "Send reset link"}
        </Button>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="text-small-regular text-ui-fg-subtle hover:text-[#980000] transition-colors"
          >
            Remember your password?{" "}
            <span className="underline font-semibold">Sign in</span>
          </button>
        </div>
      </form>
    </div>
  )
}
