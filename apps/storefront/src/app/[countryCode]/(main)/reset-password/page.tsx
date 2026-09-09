"use client"

import { useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui"
import { resetPassword } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CheckCircle2, Lock } from "lucide-react"

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Reset token is missing from the link.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setSubmitting(true)
    setError(null)

    const res = await resetPassword(token, password)
    setSubmitting(false)

    if (res.success) {
      setSuccess(true)
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="w-full flex justify-center px-4 py-16">
      <div className="max-w-sm w-full flex flex-col items-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {!token ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#980000] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-[#382C2C]">
              Invalid Reset Link
            </h1>
            <p className="text-xs text-[#4D4C4C] leading-relaxed">
              This password reset link is missing a security token or has expired.
            </p>
            <LocalizedClientLink
              href="/account"
              className="mt-4 block w-full py-3 px-4 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold text-center transition-colors shadow-sm"
            >
              Return to Login
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="w-full">
            {success && (
              <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
                  <span>Password Reset Complete</span>
                </div>
                <p className="text-xs text-green-800 leading-relaxed">
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </p>
                <LocalizedClientLink
                  href="/account"
                  className="block w-full py-2.5 px-4 rounded-lg bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold text-center transition-colors shadow-sm"
                >
                  Sign In to Account &rarr;
                </LocalizedClientLink>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full">
              <div className="w-10 h-10 rounded-full bg-red-50 text-[#980000] flex items-center justify-center mx-auto mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-[#382C2C] text-center mb-1">
                Create New Password
              </h1>
              <p className="text-xs text-[#4D4C4C] text-center mb-6">
                {email ? `For account ${email}` : "Enter your new password below."}
              </p>

              <div className="flex flex-col w-full gap-y-3">
                <Input
                  label="New Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  data-testid="new-password-input"
                />
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  data-testid="confirm-password-input"
                />
              </div>

              <ErrorMessage error={error} data-testid="reset-password-error" />

              <Button
                type="submit"
                isLoading={submitting}
                className="w-full mt-6 bg-[#980000] hover:bg-[#800000] text-white py-3 rounded-xl text-xs font-bold"
                data-testid="reset-password-submit-button"
              >
                Update Password
              </Button>

              <div className="text-center mt-6">
                <LocalizedClientLink
                  href="/account"
                  className="text-xs text-ui-fg-subtle hover:text-[#980000] transition-colors"
                >
                  Cancel and return to sign in
                </LocalizedClientLink>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
