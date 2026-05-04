'use client'

import * as React from 'react'
import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp()
  const isLoaded = !!signUp
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!signUp) return
    await signUp.sso({
      strategy,
      redirectUrl: '/os',
      redirectCallbackUrl: '/sso-callback',
    })
  }

  const handleSubmit = async (formData: FormData) => {
    const emailAddress = formData.get('email') as string
    const password = formData.get('password') as string

    if (!signUp) return

    const { error } = await signUp.password({
      emailAddress,
      password,
    })

    if (!error) {
      await signUp.verifications.sendEmailCode()
    }
  }

  const handleVerify = async (formData: FormData) => {
    const code = formData.get('code') as string

    if (!signUp) return

    await signUp.verifications.verifyEmailCode({ code })

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl('/os')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    }
  }

  if (!isLoaded) {
    return null
  }

  if (signUp.status === 'complete' || isSignedIn) {
    router.push('/os')
    return null
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Vérification de l'email</CardTitle>
            <CardDescription>
              Un code de vérification a été envoyé à votre adresse email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code de vérification</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="123456"
                  required
                />
                {errors?.fields?.code && (
                  <p className="text-sm font-medium text-destructive">{errors.fields.code.message}</p>
                )}
              </div>
              
              {errors?.global && errors.global.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.global[0].message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={fetchStatus === 'fetching'}>
                {fetchStatus === 'fetching' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Vérifier
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => signUp.verifications.sendEmailCode()}
                className="text-sm"
              >
                Renvoyer le code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte pour accéder à Uprising AOS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            <Button type="button" variant="outline" onClick={() => handleSSO('oauth_google')} disabled={fetchStatus === 'fetching'}>
              Google
            </Button>
            <Button type="button" variant="outline" onClick={() => handleSSO('oauth_github')} disabled={fetchStatus === 'fetching'}>
              GitHub
            </Button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou avec l'email</span>
            </div>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nom@exemple.com"
                required
              />
              {errors?.fields?.emailAddress && (
                <p className="text-sm font-medium text-destructive">{errors.fields.emailAddress.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
              {errors?.fields?.password && (
                <p className="text-sm font-medium text-destructive">{errors.fields.password.message}</p>
              )}
            </div>

            {errors?.global && errors.global.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>{errors.global[0].message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={fetchStatus === 'fetching'}>
              {fetchStatus === 'fetching' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Continuer
            </Button>
          </form>

          {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
          <div id="clerk-captcha" />
        </CardContent>
      </Card>
    </div>
  )
}
