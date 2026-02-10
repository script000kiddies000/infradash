'use client'

import { SidebarProvider } from './SidebarContext'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return <SidebarProvider>{children}</SidebarProvider>
}
