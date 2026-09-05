import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const rawHandle = categoryHandle.join("/")
  const decodedHandle = categoryHandle
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
    .join("/")

  const next = {
    ...(await getCacheOptions("categories")),
  }

  // Try decoded handle first
  let res = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
    `/store/product-categories`,
    {
      query: {
        fields: "*category_children, *products",
        handle: decodedHandle,
      },
      next,
      cache: "force-cache",
    }
  )

  // Fallback to raw handle if decoded had no results
  if (!res.product_categories?.length && decodedHandle !== rawHandle) {
    res = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle: rawHandle,
        },
        next,
        cache: "force-cache",
      }
    )
  }

  return res.product_categories?.[0]
}
