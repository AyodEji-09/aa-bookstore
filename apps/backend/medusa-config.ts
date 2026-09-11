import dns from "node:dns"
import { loadEnv, defineConfig } from "@medusajs/framework/utils"

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first")
}

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isR2Configured = Boolean(
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET &&
  process.env.R2_ENDPOINT &&
  process.env.R2_FILE_URL
)

const isStripeConfigured = Boolean(process.env.STRIPE_API_KEY)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: {
        ssl:
          process.env.DATABASE_URL?.includes("sslmode=require") ||
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      },
      pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 15000,
        acquireTimeoutMillis: 30000,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: "./src/modules/library",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/fez",
            id: "fez",
            options: {
              baseUrl: process.env.FEZ_BASE_URL,
              userId: process.env.FEZ_USER_ID,
              password: process.env.FEZ_PASSWORD,
              secretKey: process.env.FEZ_SECRET_KEY,
              defaultPickupState: process.env.FEZ_PICKUP_STATE || "Lagos",
              defaultPickupAddress: process.env.FEZ_PICKUP_ADDRESS,
              defaultSenderPhone: process.env.FEZ_SENDER_PHONE,
              defaultSenderName: process.env.FEZ_SENDER_NAME,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/resend",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from: process.env.RESEND_FROM_EMAIL,
            },
          },
        ],
      },
    },
    ...(isStripeConfigured
      ? [
          {
            resolve: "@medusajs/medusa/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                    automaticPaymentMethods: true,
                    capture: true,
                  },
                },
              ],
            },
          },
        ]
      : []),
    ...(isR2Configured
      ? [
          {
            resolve: "@medusajs/medusa/file",
            options: {
              providers: [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "s3",
                  options: {
                    file_url: process.env.R2_FILE_URL,
                    access_key_id: process.env.R2_ACCESS_KEY_ID,
                    secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
                    bucket: process.env.R2_BUCKET,
                    endpoint: process.env.R2_ENDPOINT,
                    region: process.env.R2_REGION || "auto",
                    acl: false,
                    additional_client_config: {
                      forcePathStyle: true,
                    },
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
