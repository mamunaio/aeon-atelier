import type { Metadata } from 'next'
import { AppShell } from '../components/layout/AppShell'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://taiomei.com'),
  title: 'TaioMei — Wear Your Style. Create Your Identity.',
  description:
    'TaioMei — high-end international luxury fashion house. Numbered editions, bespoke customization, and express global delivery.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'TaioMei — International Luxury Fashion',
    description: 'Obsidian craft, crimson seal, tailored for global movement.',
    images: ['/logo.png'],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
