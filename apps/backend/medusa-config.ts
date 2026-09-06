import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const isR2Configured = Boolean(
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET &&
  process.env.R2_ENDPOINT &&
  process.env.R2_FILE_URL
)

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
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
