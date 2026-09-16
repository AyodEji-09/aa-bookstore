"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import Input from "@modules/common/components/input"
import { Button } from "@modules/common/components/ui"
import { resetPassword } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { toast } from "@medusajs/ui"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Reset token is missing from the link.")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setSubmitting(true)

    const res = await resetPassword(token, password)
    setSubmitting(false)

    if (res.success) {
      toast.success("Password reset complete. You can now sign in.")
      router.push("/account")
    } else {
      toast.error(res.error || "Failed to reset password.")
    }
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      <div className="mb-8 sm:mb-10 text-center">
        <LocalizedClientLink href="/" className="inline-block">
          <Image
            src="/images/logo.png"
            alt="Ayodeji Anifowose Store"
            width={200}
            height={55}
            className="h-9 sm:h-11 w-auto object-contain"
            priority
          />
        </LocalizedClientLink>
      </div>

      <div className="max-w-sm w-full flex flex-col items-center">
        {!token ? (
          <div className="text-center space-y-4 w-full">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-center text-gray-900 mb-3">
              Invalid Reset Link
            </h1>
            <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
              This password reset link is missing a security token or has
              expired.
            </p>
            <LocalizedClientLink
              href="/account"
              className="w-full inline-flex items-center justify-center h-12 rounded-full bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Return to Login
            </LocalizedClientLink>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-center text-gray-900 mb-2">
              Create New Password
            </h1>
            <p className="text-center text-sm text-gray-600 mb-8 leading-relaxed">
              {email
                ? `For account ${email}`
                : "Enter your new password below."}
            </p>

            <form onSubmit={handleSubmit} className="w-full">
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

              <Button
                type="submit"
                isLoading={submitting}
                className="w-full mt-6 h-12 rounded-full bg-[#980000] hover:bg-[#7a0000] text-white text-sm font-semibold transition-colors shadow-sm"
                data-testid="reset-password-submit-button"
              >
                Update Password
              </Button>

              <div className="text-center text-sm text-gray-600 mt-8">
                <LocalizedClientLink
                  href="/account"
                  className="underline font-semibold text-gray-900 hover:text-[#980000] transition-colors"
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
