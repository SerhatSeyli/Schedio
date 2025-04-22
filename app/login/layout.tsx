import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Schedio',
  description: 'Login to your Schedio account',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {children}
    </div>
  )
}
