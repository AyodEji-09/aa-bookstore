"use client"

import { useState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import Input from "@modules/common/components/input"
import { toast } from "@medusajs/ui"
import { Button } from "@modules/common/components/ui"
import { requestPasswordReset } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

export default function ForgotPassword({ setCurrentView }: Props) {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubmitting(true)

    const res = await requestPasswordReset(email)
    setSubmitting(false)

    if (res.success) {
      toast.success(
        `If an account exists for ${email}, a password reset email has been sent.`
      )
    } else {
      toast.error(res.error || "Failed to send reset link")
    }
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <h1 className="text-2xl sm:text-3xl font-serif font-normal text-center text-gray-900 mb-3">
        Reset Password
      </h1>
      <p className="text-center text-sm text-gray-600 mb-8 leading-relaxed">
        Enter your email address and we will send you a secure link to reset
        your password.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Email address"
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

        <Button
          type="submit"
          isLoading={submitting}
          className="w-full mt-6 h-12 rounded-full bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-semibold transition-colors shadow-sm"
          data-testid="send-reset-link-button"
        >
          Send reset link
        </Button>

        <div className="text-center text-sm text-gray-600 mt-8">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="underline font-semibold text-gray-900 hover:text-[#980000] transition-colors"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  )
}
