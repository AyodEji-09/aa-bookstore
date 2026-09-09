"use server"

import https from "node:https"

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please provide a valid email address." }
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID || "e8f882c7-598a-46bd-8720-ab7affbb1185"

  if (!apiKey) {
    console.log(`[Newsletter] Dev mode subscription for: ${email}`)
    return { success: true }
  }

  return new Promise((resolve) => {
    const data = JSON.stringify({ email: email.trim().toLowerCase(), unsubscribed: false })
    const options = {
      hostname: "api.resend.com",
      path: `/audiences/${audienceId}/contacts`,
      method: "POST",
      family: 4,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        "User-Agent": "ayollc-bookstore",
      },
    }

    const req = https.request(options, (res) => {
      let responseBody = ""
      res.on("data", (chunk) => (responseBody += chunk))
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true })
        } else {
          try {
            const parsed = JSON.parse(responseBody)
            if (parsed?.message?.toLowerCase().includes("already") || parsed?.name === "conflict") {
              return resolve({ success: true })
            }
          } catch {}
          resolve({ success: true })
        }
      })
    })

    req.on("error", (err) => {
      console.error("[Newsletter Error]:", err)
      resolve({ success: true })
    })

    req.write(data)
    req.end()
  })
}
