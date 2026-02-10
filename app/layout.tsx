import type { Metadata } from 'next'
import './globals.css'
import ClientProviders from '@/components/layout/ClientProviders'

export const metadata: Metadata = {
    title: 'InfraDash - Infrastructure Dashboard',
    description: 'Manage your infrastructure services, hosts, and ports',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    )
}
