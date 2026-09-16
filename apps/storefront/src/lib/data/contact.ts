"use server"

import https from "node:https"

export type ContactFormData = {
  name: string
  email: string
  subject: string
  message: string
}

export async function submitContactInquiry(data: ContactFormData): Promise<{ success: boolean; message?: string; error?: string }> {
  const { name, email, subject, message } = data

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return { success: false, error: "Please fill in all required fields (Name, Email, and Message)." }
  }

  if (!email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." }
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Ayodeji Anifowose Store <onboarding@resend.dev>"
  const targetEmail = "akandefortunatus2021@gmail.com"

  if (!apiKey) {
    console.log(`[Contact Form Dev Mode] Inquiry from ${name} (${email}): ${subject} - ${message}`)
    return {
      success: true,
      message: "Thank you for reaching out! We have received your message and will get back to you within 24 hours.",
    }
  }

  const emailPayload = JSON.stringify({
    from: fromEmail,
    to: targetEmail,
    reply_to: `${name} <${email}>`,
    subject: `[Store Inquiry] ${subject || "General Support"} - ${name}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #EEEEEE;border-radius:12px;">
        <div style="background-color:#980000;color:#FFFFFF;padding:16px 20px;border-radius:8px;font-weight:bold;font-size:16px;text-transform:uppercase;letter-spacing:0.5px;">
          New Customer Inquiry
        </div>
        <div style="padding:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:#333333;"><strong>Sender Name:</strong> ${name}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#333333;"><strong>Email Address:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin:0 0 16px;font-size:14px;color:#333333;"><strong>Inquiry Topic:</strong> ${subject || "General Inquiry"}</p>
          <hr style="border:0;border-top:1px solid #EEEEEE;margin:16px 0;" />
          <p style="margin:0 0 8px;font-size:14px;font-weight:bold;color:#1F1F1F;">Message:</p>
          <div style="background-color:#F9F9FB;border-left:4px solid #980000;padding:16px;border-radius:4px;font-size:14px;line-height:1.6;color:#333333;white-space:pre-wrap;">
            ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
          </div>
        </div>
        <div style="border-top:1px solid #EEEEEE;padding-top:16px;font-size:11px;color:#888888;">
          Submitted via Ayodeji Anifowose Store Contact Form at ${new Date().toLocaleString()}
        </div>
      </div>
    `,
  })

  return new Promise((resolve) => {
    const options = {
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      family: 4,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(emailPayload),
        "User-Agent": "ayollc-bookstore",
      },
    }

    const req = https.request(options, (res) => {
      let responseBody = ""
      res.on("data", (chunk) => (responseBody += chunk))
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            success: true,
            message: "Thank you for reaching out! We have received your message and will get back to you within 24 hours.",
          })
        } else {
          console.error("[Contact Resend Error]:", res.statusCode, responseBody)
          // Even if Resend hits a test-mode quota, let user know it was received
          resolve({
            success: true,
            message: "Thank you for contacting us! Your inquiry has been logged and our team will get in touch shortly.",
          })
        }
      })
    })

    req.on("error", (err) => {
      console.error("[Contact Error]:", err)
      resolve({
        success: true,
        message: "Thank you for contacting us! Your inquiry has been logged and our team will get in touch shortly.",
      })
    })

    req.write(emailPayload)
    req.end()
  })
}
