"use client"

import { useState } from "react"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    setEmail("")
  }

  if (subscribed) {
    return (
      <div className="p-3 bg-black/30 rounded text-xs text-white text-center font-medium">
        Thank you for subscribing!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full px-3.5 py-2.5 rounded text-xs text-[#382C2C] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <button
        type="submit"
        className="w-full py-2.5 px-4 bg-black hover:bg-gray-900 text-white text-xs font-bold rounded transition-colors uppercase tracking-wider"
      >
        Request Access
      </button>
    </form>
  )
}
