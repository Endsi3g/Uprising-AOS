'use client'

import * as React from 'react'
import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Globe, Github } from 'lucide-react'

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

  if (!isLoaded) return null

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
      <div className="flex items-center justify-center min-h-screen bg-black p-4 font-sans">
        <Card className="w-full max-w-md border-border/20 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Vérification</CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Saisissez le code envoyé par email.
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
                  className="bg-background/50 border-border/20 text-center text-2xl tracking-[0.5em] h-14 font-mono"
                  required
                />
                {errors?.fields?.code && (
                  <p className="text-xs font-medium text-destructive">{errors.fields.code.message}</p>
                )}
              </div>
              
              {errors?.global && errors.global.length > 0 && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-xs">
                  <AlertDescription>{errors.global[0].message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11 font-semibold" disabled={fetchStatus === 'fetching'}>
                {fetchStatus === 'fetching' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Vérifier le compte
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => signUp.verifications.sendEmailCode()}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
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
    <div className="flex items-center justify-center min-h-screen bg-black p-4 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_100%)] z-0" />
      
      <Card className="w-full max-w-md border-border/20 bg-card/50 backdrop-blur-2xl shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
             <div className="h-6 w-6 rounded-full bg-white animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Inscription</CardTitle>
          <CardDescription className="text-muted-foreground/80">
            Créez votre accès à l'écosystème Uprising.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              type="button" 
              variant="outline" 
              className="border-border/20 bg-white/5 hover:bg-white/10 h-11 transition-all active:scale-95"
              onClick={() => handleSSO('oauth_google')} 
              disabled={fetchStatus === 'fetching'}
            >
              <Globe className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-border/20 bg-white/5 hover:bg-white/10 h-11 transition-all active:scale-95"
              onClick={() => handleSSO('oauth_github')} 
              disabled={fetchStatus === 'fetching'}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0c0c0e] px-4 text-muted-foreground font-bold">ou continuer avec</span>
            </div>
          </div>

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">Email professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nom@studio.com"
                  className="bg-background/40 border-border/20 pl-10 h-11 focus-visible:ring-primary/30"
                  required
                />
              </div>
              {errors?.fields?.emailAddress && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-tight ml-1">{errors.fields.emailAddress.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" id="password-label" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 ml-1">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="bg-background/40 border-border/20 pl-10 h-11 focus-visible:ring-primary/30"
                  required
                />
              </div>
              {errors?.fields?.password && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-tight ml-1">{errors.fields.password.message}</p>
              )}
            </div>

            {errors?.global && errors.global.length > 0 && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-xs py-2">
                <AlertDescription>{errors.global[0].message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/20 bg-white text-black hover:bg-white/90 active:scale-[0.98] transition-all" disabled={fetchStatus === 'fetching'}>
              {fetchStatus === 'fetching' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Créer mon compte
            </Button>
          </form>

          <div className="mt-8 text-center text-xs">
            <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
            <Button 
              variant="link" 
              className="p-0 h-auto font-bold text-primary hover:no-underline" 
              onClick={() => router.push('/sign-in')}
            >
              Se connecter
            </Button>
          </div>

          <div id="clerk-captcha" className="mt-4" />
        </CardContent>
      </Card>
    </div>
  )
}
