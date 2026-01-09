'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (error === 'OAuthSignin') {
      setErrorMessage('Error initializing Google Sign-In. Please check your server configuration (Client ID/Secret).')
    } else if (error === 'OAuthCallback') {
      setErrorMessage('Error during Google Sign-In callback. Please try again.')
    } else if (error) {
      setErrorMessage(`Authentication Error: ${error}`)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-nexa-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-nexa-gray/30 border border-white/10 p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexa-gold to-white mb-2">
                Nexa Digital
            </h1>
            <p className="text-gray-400">Admin Portal Access</p>
        </div>
        
        {errorMessage && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                {errorMessage}
            </div>
        )}

        <div className="space-y-4">
            <button 
                onClick={() => signIn('google', { callbackUrl: '/admin' })}
                className="w-full bg-nexa-gold text-nexa-black font-bold py-3 rounded-lg hover:bg-nexa-goldHover transition-colors flex items-center justify-center gap-2"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign In with Google
            </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
            Protected Area. Authorized Personnel Only.
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
