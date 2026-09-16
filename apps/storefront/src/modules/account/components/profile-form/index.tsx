"use client"

import React, { useActionState, useEffect, useMemo } from "react"
import Input from "@modules/common/components/input"
import NativeSelect from "@modules/common/components/native-select"
import { Button } from "@modules/common/components/ui"
import {
  updateCustomer,
  updateCustomerAddress,
  addCustomerAddress,
} from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { toast } from "@medusajs/ui"

type ProfileFormProps = {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}

const Divider = () => <div className="w-full h-px bg-gray-200 my-6" />

export default function ProfileForm({ customer, regions }: ProfileFormProps) {
  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  const regionOptions = useMemo(() => {
    return (
      regions
        ?.map((region) => {
          return region.countries?.map((country) => ({
            value: country.iso_2,
            label: country.display_name,
          }))
        })
        .flat() || []
    )
  }, [regions])

  const updateAllProfileInfo = async (
    _currentState: { success: boolean; error: string | null },
    formData: FormData
  ) => {
    try {
      // 1. Update customer profile details (first_name, last_name, phone)
      const firstName = (formData.get("first_name") as string) || ""
      const lastName = (formData.get("last_name") as string) || ""
      const phone = (formData.get("phone") as string) || ""

      await updateCustomer({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      })

      // 2. Update or create billing address if address fields are provided
      const address1 = formData.get("address_1") as string
      const city = formData.get("city") as string
      const countryCode = formData.get("country_code") as string

      if (address1 && city && countryCode) {
        if (billingAddress?.id) {
          const res = await updateCustomerAddress(
            { addressId: billingAddress.id },
            formData
          )
          if (!res.success) {
            return { success: false, error: res.error }
          }
        } else {
          const res = await addCustomerAddress(
            { isDefaultBilling: true, isDefaultShipping: false },
            formData
          )
          if (!res.success) {
            return { success: false, error: res.error }
          }
        }
      }

      return { success: true, error: null }
    } catch (err: any) {
      return { success: false, error: err?.message || String(err) }
    }
  }

  const [state, formAction, isPending] = useActionState(updateAllProfileInfo, {
    success: false,
    error: null,
  })

  useEffect(() => {
    if (state.success) {
      toast.success("Profile updated successfully")
    }
    if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form action={formAction} className="w-full">
      {billingAddress?.id && (
        <input type="hidden" name="addressId" value={billingAddress.id} />
      )}

      {/* Personal Information Section */}
      <div className="space-y-4">
        <h2 className="text-base-semi">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            name="first_name"
            required
            defaultValue={customer.first_name ?? ""}
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            defaultValue={customer.last_name ?? ""}
            data-testid="last-name-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            disabled
            defaultValue={customer.email ?? ""}
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="phone"
            defaultValue={customer.phone ?? ""}
            data-testid="phone-input"
          />
        </div>
      </div>

      <Divider />

      {/* Billing Address Section */}
      <div className="space-y-4">
        <h2 className="text-base-semi">Billing Address</h2>
        <div className="grid grid-cols-1 gap-y-4">
          <Input
            label="Company"
            name="company"
            defaultValue={billingAddress?.company || undefined}
            data-testid="billing-company-input"
          />
          <Input
            label="Address"
            name="address_1"
            defaultValue={billingAddress?.address_1 || undefined}
            data-testid="billing-address-1-input"
          />
          <Input
            label="Apartment, suite, etc."
            name="address_2"
            defaultValue={billingAddress?.address_2 || undefined}
            data-testid="billing-address-2-input"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[144px_1fr] gap-4">
            <Input
              label="Postal code"
              name="postal_code"
              defaultValue={billingAddress?.postal_code || undefined}
              data-testid="billing-postcal-code-input"
            />
            <Input
              label="City"
              name="city"
              defaultValue={billingAddress?.city || undefined}
              data-testid="billing-city-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Province"
              name="province"
              defaultValue={billingAddress?.province || undefined}
              data-testid="billing-province-input"
            />
            <NativeSelect
              name="country_code"
              defaultValue={billingAddress?.country_code || undefined}
              data-testid="billing-country-code-select"
            >
              <option value="">Select country</option>
              {regionOptions.map((option, i) => (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
      </div>

      <Divider />

      {/* Single Save Changes Button */}
      <div className="flex justify-end pt-2">
        <Button
          isLoading={isPending}
          className="w-full small:max-w-[160px]"
          type="submit"
          data-testid="save-profile-button"
        >
          Save changes
        </Button>
      </div>
    </form>
  )
}
