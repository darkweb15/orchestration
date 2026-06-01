'use client'

import { useState } from 'react'
import HeroSection from './HeroSection'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-100 via-purple-50 to-white">
      {/* Left Section - Hero */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col">
        <HeroSection />
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <LoginForm />
      </div>
    </div>
  )
}
