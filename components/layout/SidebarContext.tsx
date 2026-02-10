'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
    isOpen: boolean
    toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({ isOpen: false, toggle: () => { } })

export function useSidebar() { return useContext(SidebarContext) }

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-open')
        if (saved === 'true') setIsOpen(true)
    }, [])

    const toggle = () => {
        setIsOpen(prev => {
            localStorage.setItem('sidebar-open', String(!prev))
            return !prev
        })
    }

    return (
        <SidebarContext.Provider value={{ isOpen, toggle }}>
            {children}
        </SidebarContext.Provider>
    )
}
