'use client'

import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react'
import SocialButtons from './SocialButtons'

export default function LoginForm() {
  const [activeTab, setActiveTab] = useState<'email' | 'api'>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { ...formData, rememberMe })
  }

  return (
    <div className="w-full max-w-md">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back <span className="text-2xl">👋</span>
        </h2>
        <p className="text-gray-600">Sign in to your Agentic Scraper account</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('email')}
          className={`pb-4 px-4 font-semibold text-sm relative transition-colors ${
            activeTab === 'email'
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Email Login
          {activeTab === 'email' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`pb-4 px-4 font-semibold text-sm relative transition-colors ${
            activeTab === 'api'
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          API Key Login
          {activeTab === 'api' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
      </div>

      {/* Login Form */}
      {activeTab === 'email' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}

      {/* API Key Tab Content */}
      {activeTab === 'api' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="api-key"
                placeholder="Enter your API key"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            Sign In
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-600">or continue with</span>
        </div>
      </div>

      {/* Social Buttons */}
      <SocialButtons />

      {/* Sign Up Link */}
      <p className="text-center text-gray-600 mt-8">
        Don&apos;t have an account?{' '}
        <a href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
          Sign up now
        </a>
      </p>

      {/* Security Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Enterprise Grade Security</p>
            <p className="text-xs text-gray-600 mt-1">
              Your data is encrypted and protected
            </p>
            <p className="text-xs text-gray-500 mt-2">
              SOC 2 • GDPR • ISO 27001 Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
