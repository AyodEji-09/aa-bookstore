"use client"

import { useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import ForgotPassword from "@modules/account/components/forgot-password"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
  FORGOT_PASSWORD = "forgot-password",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
      <div className="mb-8 sm:mb-10 text-center">
        <LocalizedClientLink href="/" className="inline-block">
          <Image
            src="/images/logo.png"
            alt="Ayodeji Anifowose Bookstore"
            width={200}
            height={55}
            className="h-9 sm:h-11 w-auto object-contain"
            priority
          />
        </LocalizedClientLink>
      </div>

      <div className="w-full flex flex-col items-center">
        {currentView === LOGIN_VIEW.SIGN_IN ? (
          <Login setCurrentView={setCurrentView} />
        ) : currentView === LOGIN_VIEW.REGISTER ? (
          <Register setCurrentView={setCurrentView} />
        ) : (
          <ForgotPassword setCurrentView={setCurrentView} />
        )}
      </div>
    </div>
  )
}

export default LoginTemplate
