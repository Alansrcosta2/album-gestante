import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ensaio Gestante | Karine & Alan',
  description: 'Álbum digital do ensaio gestante de Karine & Alan',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
