'use client'

import * as React from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn()
  const isLoaded = !!signIn
  const router = useRouter()

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_github') => {
    if (!signIn) return
    await signIn.sso({
      strategy,
      redirectUrl: '/os',
      redirectCallbackUrl: '/sso-callback',
    })
  }

  const handleSubmit = async (formData: FormData) => {
    const emailAddress = formData.get('email') as string
    const password = formData.get('password') as string

    if (!signIn) return

    await signIn.password({
      identifier: emailAddress,
      password,
    })

    if (signIn.status === 'complete') {
      await signIn.finalize({
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

  const handleMFA = async (formData: FormData) => {
    const code = formData.get('code') as string
    if (!signIn) return

    await signIn.mfa.verifyTOTP({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
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

  if (!isLoaded) return null

  if (signIn.status === 'needs_second_factor') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>
              Veuillez entrer le code de votre application d'authentification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleMFA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code MFA</Label>
                <Input id="code" name="code" type="text" placeholder="123456" required />
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
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Accédez à Uprising AOS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            <Button variant="outline" onClick={() => handleSSO('oauth_google')} disabled={fetchStatus === 'fetching'}>
              Google
            </Button>
            <Button variant="outline" onClick={() => handleSSO('oauth_github')} disabled={fetchStatus === 'fetching'}>
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
              {errors?.fields?.identifier && (
                <p className="text-sm font-medium text-destructive">{errors.fields.identifier.message}</p>
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
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
