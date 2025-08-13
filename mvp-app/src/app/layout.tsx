import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'CareerFirst',
  description: 'Edtech платформа: учись быстрее, устройся раньше.',
}

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} min-h-dvh antialiased`}>
        <Header />
        <main className="container mx-auto px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
