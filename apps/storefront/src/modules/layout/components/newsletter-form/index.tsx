"use client"

import { useState } from "react"
import { subscribeToNewsletter } from "@lib/data/newsletter"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    await subscribeToNewsletter(email)
    setSubmitting(false)
    setSubscribed(true)
    setEmail("")
  }

  return (
    <div className="space-y-3">
      {subscribed && (
        <div className="p-3 bg-white/10 border border-white/20 rounded text-xs text-white text-center font-medium">
          Thank you for subscribing! You are now on our mailing list.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          disabled={submitting}
          className="w-full px-3.5 py-2.5 rounded text-xs text-[#980000] bg-white placeholder:text-[#980000] focus:outline-none focus:ring-2 focus:ring-[#980000]/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-[#980000] text-xs font-bold rounded transition-colors disabled:opacity-60 shadow-sm"
        >
          {submitting ? "Joining..." : subscribed ? "Subscribed!" : "Subscribe"}
        </button>
      </form>
    </div>
  )
}
