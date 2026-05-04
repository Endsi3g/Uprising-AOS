import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { RealtimeProvider } from '@/components/providers/realtime-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Uprising Agency OS',
  description: 'Agency Operating System — Uprising Studio',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RealtimeProvider>
              {children}
              <Toaster />
            </RealtimeProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
