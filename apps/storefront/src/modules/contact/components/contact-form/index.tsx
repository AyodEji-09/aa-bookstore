"use client"

import { useState } from "react"
import { submitContactInquiry, ContactFormData } from "@lib/data/contact"
import { Button } from "@modules/common/components/ui"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "Order Support",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)

    const res = await submitContactInquiry(formData)
    setSubmitting(false)

    if (res.success) {
      setStatus({
        type: "success",
        message:
          res.message ||
          "Thank you for contacting us! Your inquiry has been received and our team will get back to you within 24 hours.",
      })
      setFormData({
        name: "",
        email: "",
        subject: "Order Support",
        message: "",
      })
    } else {
      setStatus({
        type: "error",
        message: res.error || "Failed to send message. Please try again.",
      })
    }
  }

  return (
    <div className="w-full">
      {status && (
        <div
          className={`w-full mb-6 p-4 rounded-xl text-xs leading-relaxed font-medium border flex items-start gap-2.5 ${
            status.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-[#980000] border-[#980000]/20"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#980000] flex-shrink-0 mt-0.5" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-[#382C2C] mb-1.5"
            >
              Full Name <span className="text-[#980000]">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Alexander Hamilton"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-[#382C2C] bg-[#FAFAFA] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980000]/30 focus:border-[#980000]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#382C2C] mb-1.5"
            >
              Email Address <span className="text-[#980000]">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. reader@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-[#382C2C] bg-[#FAFAFA] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980000]/30 focus:border-[#980000]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-semibold text-[#382C2C] mb-1.5"
          >
            Inquiry Topic
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-[#382C2C] bg-[#FAFAFA] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980000]/30 focus:border-[#980000]"
          >
            <option value="Order Support">Order Support & Physical Tracking</option>
            <option value="Digital Library">Digital Library (eBook / Audiobook Access)</option>
            <option value="Author Events & Speaking">Author Events, Book Signings & Speaking</option>
            <option value="Bulk Order">Bulk Orders for Schools & Book Clubs</option>
            <option value="General Inquiry">General Question or Feedback</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-xs font-semibold text-[#382C2C] mb-1.5"
          >
            Message <span className="text-[#980000]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Please detail your question or order number..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-[#382C2C] bg-[#FAFAFA] border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#980000]/30 focus:border-[#980000] leading-relaxed resize-none"
          />
        </div>

        <Button
          type="submit"
          isLoading={submitting}
          className="w-full py-3 px-6 rounded-xl bg-[#980000] hover:bg-[#800000] text-white text-xs font-bold transition-all shadow-sm"
        >
          Send Inquiry
        </Button>
      </form>
    </div>
  )
}
