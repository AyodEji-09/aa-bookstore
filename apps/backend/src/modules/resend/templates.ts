interface OrderEmailItem {
  title: string
  thumbnail?: string | null
  format?: string | null
  quantity: number
  unit_price: number
  total: number
}

interface OrderEmailData {
  order_id: string
  display_id?: string | number
  customer_name: string
  items: OrderEmailItem[]
  subtotal: number
  shipping_total: number
  tax_total: number
  total: number
  currency_code: string
  has_digital_items: boolean
  library_url: string
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    city?: string
    country_code?: string
    postal_code?: string
  }
}

interface PasswordResetEmailData {
  customer_name?: string
  email: string
  reset_url: string
  actor_type?: "customer" | "user" | string
}

function formatCurrency(amount: number, currencyCode: string): string {
  const code = (currencyCode || "usd").toUpperCase()
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
  }).format(amount / 100)
}

export function renderOrderPlacedEmail(data: OrderEmailData): {
  subject: string
  html: string
} {
  const orderRef = data.display_id ? `#${data.display_id}` : data.order_id
  const subject = `Order Confirmed: ${orderRef} - Ayodeji Anifowose Bookstore`

  const itemsHtml = data.items
    .map((item) => {
      const formatBadge = item.format
        ? `<span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;color:#980000;background-color:#FDF2F2;border-radius:999px;text-transform:uppercase;margin-top:4px;">${item.format}</span>`
        : ""

      const coverHtml = item.thumbnail
        ? `<img src="${item.thumbnail}" alt="${item.title}" style="width:52px;height:72px;object-fit:cover;border-radius:6px;border:1px solid #EEEEEE;" />`
        : `<div style="width:52px;height:72px;background-color:#F5F5F5;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#999999;font-size:11px;font-weight:600;">Book</div>`

      return `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #F0F0F0;vertical-align:top;width:64px;">
            ${coverHtml}
          </td>
          <td style="padding:16px 12px;border-bottom:1px solid #F0F0F0;vertical-align:top;">
            <div style="font-size:14px;font-weight:700;color:#1F1F1F;line-height:1.3;">${item.title}</div>
            ${formatBadge}
            <div style="font-size:12px;color:#666666;margin-top:4px;">Qty: ${item.quantity}</div>
          </td>
          <td style="padding:16px 0;border-bottom:1px solid #F0F0F0;vertical-align:top;text-align:right;font-size:14px;font-weight:700;color:#1F1F1F;">
            ${formatCurrency(item.total, data.currency_code)}
          </td>
        </tr>
      `
    })
    .join("")

  const digitalActionBanner = data.has_digital_items
    ? `
      <div style="background-color:#FDF2F2;border:1px solid #F9D6D6;border-radius:12px;padding:20px;margin:28px 0;text-align:center;">
        <div style="font-size:16px;font-weight:800;color:#980000;margin-bottom:6px;">Your Digital Books are Ready!</div>
        <div style="font-size:13px;color:#4A3B32;line-height:1.5;margin-bottom:16px;">
          You can stream your audiobooks or read your ebooks immediately in your digital library.
        </div>
        <a href="${data.library_url}" style="display:inline-block;background-color:#980000;color:#FFFFFF;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">
          Open My Digital Library &rarr;
        </a>
      </div>
    `
    : ""

  const shippingInfo = data.shipping_address?.address_1
    ? `
      <div style="margin-top:24px;padding:16px;background-color:#FAFAFA;border-radius:10px;font-size:12px;color:#4A3B32;line-height:1.6;">
        <strong style="display:block;margin-bottom:4px;color:#1F1F1F;font-size:13px;">Shipping Address:</strong>
        ${data.shipping_address.first_name || ""} ${data.shipping_address.last_name || ""}<br />
        ${data.shipping_address.address_1}<br />
        ${data.shipping_address.city || ""}, ${data.shipping_address.country_code?.toUpperCase() || ""} ${data.shipping_address.postal_code || ""}
      </div>
    `
    : ""

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F7F7F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7F7F8;padding:32px 12px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <!-- Header -->
                <tr>
                  <td style="padding:28px 32px;background-color:#980000;text-align:center;">
                    <div style="font-size:18px;font-weight:900;color:#FFFFFF;letter-spacing:0.5px;text-transform:uppercase;">
                      Ayodeji Anifowose Bookstore
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:32px;">
                    <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1F1F1F;">Thank You for Your Order!</h1>
                    <p style="margin:0 0 20px;font-size:14px;color:#555555;line-height:1.5;">
                      Hello ${data.customer_name || "Reader"}, your order has been confirmed. Below are your purchase details.
                    </p>

                    ${digitalActionBanner}

                    <!-- Items Table -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                      ${itemsHtml}
                    </table>

                    <!-- Totals -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:20px;font-size:13px;color:#555555;">
                      <tr>
                        <td style="padding:6px 0;">Subtotal</td>
                        <td style="padding:6px 0;text-align:right;font-weight:600;color:#1F1F1F;">${formatCurrency(data.subtotal, data.currency_code)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;">Shipping</td>
                        <td style="padding:6px 0;text-align:right;font-weight:600;color:#1F1F1F;">${data.shipping_total === 0 ? "Free" : formatCurrency(data.shipping_total, data.currency_code)}</td>
                      </tr>
                      ${
                        data.tax_total > 0
                          ? `
                          <tr>
                            <td style="padding:6px 0;">Taxes</td>
                            <td style="padding:6px 0;text-align:right;font-weight:600;color:#1F1F1F;">${formatCurrency(data.tax_total, data.currency_code)}</td>
                          </tr>
                          `
                          : ""
                      }
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#1F1F1F;border-top:1px solid #EAEAEA;">Total</td>
                        <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#980000;border-top:1px solid #EAEAEA;text-align:right;">
                          ${formatCurrency(data.total, data.currency_code)}
                        </td>
                      </tr>
                    </table>

                    ${shippingInfo}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:24px 32px;background-color:#FAFAFA;border-top:1px solid #F0F0F0;text-align:center;font-size:11px;color:#888888;line-height:1.5;">
                    &copy; ${new Date().getFullYear()} Ayodeji Anifowose Bookstore. All rights reserved.<br />
                    Questions? Reply to this email or visit our store support.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return { subject, html }
}

export function renderPasswordResetEmail(data: PasswordResetEmailData): {
  subject: string
  html: string
} {
  const isAdmin = data.actor_type === "user"
  const subject = isAdmin
    ? "Reset Your Admin Password - Ayodeji Anifowose Bookstore"
    : "Reset Your Password - Ayodeji Anifowose Bookstore"

  const title = isAdmin
    ? "Admin Password Reset Request"
    : "Password Reset Request"

  const greeting = isAdmin
    ? `Hello Administrator, we received a request to reset your password for your bookstore management account (${data.email}).`
    : `Hello ${data.customer_name || "Reader"}, we received a request to reset your password for your bookstore account (${data.email}).`

  const buttonText = isAdmin ? "Reset Admin Password" : "Reset Password"

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F7F7F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F7F7F8;padding:32px 12px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <!-- Header -->
                <tr>
                  <td style="padding:28px 32px;background-color:#980000;text-align:center;">
                    <div style="font-size:18px;font-weight:900;color:#FFFFFF;letter-spacing:0.5px;text-transform:uppercase;">
                      Ayodeji Anifowose Bookstore
                    </div>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:32px;">
                    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#1F1F1F;">${title}</h1>
                    <p style="margin:0 0 20px;font-size:14px;color:#555555;line-height:1.5;">
                      ${greeting}
                    </p>
                    <p style="margin:0 0 24px;font-size:14px;color:#555555;line-height:1.5;">
                      Click the button below to choose a new password. This link will expire in <strong>15 minutes</strong>.
                    </p>

                    <div style="text-align:center;margin:32px 0;">
                      <a href="${data.reset_url}" style="display:inline-block;background-color:#980000;color:#FFFFFF;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">
                        ${buttonText}
                      </a>
                    </div>

                    <p style="margin:24px 0 0;font-size:12px;color:#888888;line-height:1.5;">
                      If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 32px;background-color:#FAFAFA;border-top:1px solid #F0F0F0;text-align:center;font-size:11px;color:#888888;">
                    &copy; ${new Date().getFullYear()} Ayodeji Anifowose Bookstore. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return { subject, html }
}
