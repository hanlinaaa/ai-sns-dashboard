import type { Metadata } from 'next'
import { Noto_Sans_JP, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'サクサクSNS君 - AIコンテンツジェネレーター',
  description: 'AIでSNS投稿を簡単に作成。X、Instagram、LINEに最適化されたコンテンツを瞬時に生成。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="bg-background" suppressHydrationWarning>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
