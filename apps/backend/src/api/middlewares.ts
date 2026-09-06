import { authenticate, defineMiddlewares } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/me/library*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/admin/products/:id/digital-assets*",
      middlewares: [authenticate("user", ["session", "bearer", "api-key"])],
    },
  ],
})
