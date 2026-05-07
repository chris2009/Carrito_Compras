import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shopflow.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    template: '%s | ShopFlow',
    default: 'ShopFlow — Tu tienda online en minutos',
  },
  description: 'SaaS multi-tenant de e-commerce. Crea tu tienda online gratis y empieza a vender hoy mismo.',
  keywords: ['tienda online', 'e-commerce', 'vender online', 'carrito de compras', 'shopflow'],
  authors: [{ name: 'ShopFlow' }],
  openGraph: {
    type: 'website',
    siteName: 'ShopFlow',
    title: 'ShopFlow — Tu tienda online en minutos',
    description: 'SaaS multi-tenant de e-commerce. Crea tu tienda online gratis y empieza a vender.',
    url: APP_URL,
    locale: 'es_PE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopFlow — Tu tienda online en minutos',
    description: 'SaaS multi-tenant de e-commerce. Crea tu tienda online gratis y empieza a vender.',
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShopFlow',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
