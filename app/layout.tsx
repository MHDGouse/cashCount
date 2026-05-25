import type { Metadata, Viewport } from 'next'
import { Poppins, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f1f3d',
}

export const metadata: Metadata = {
  title: 'CashCount — Indian Rupee Counter',
  description: 'Count and manage Indian currency denominations with ease',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CashCount',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${jetbrains.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
