'use client'

import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'

export default function DynamicHead() {
    const { settings } = useSiteSettings()

    useEffect(() => {
        // Update favicon dynamically if set in settings
        if (settings?.favicon_url) {
            // Remove existing favicons
            const existingFavicons = document.querySelectorAll("link[rel*='icon']")
            existingFavicons.forEach(favicon => favicon.remove())

            // Add new favicon
            const link = document.createElement('link')
            link.rel = 'icon'
            link.href = settings.favicon_url
            document.head.appendChild(link)
        }

        // Update page title if site name is set
        if (settings?.site_name) {
            const currentTitle = document.title
            if (currentTitle.includes('WebinarPro')) {
                document.title = currentTitle.replace('WebinarPro', settings.site_name)
            }
        }
    }, [settings?.favicon_url, settings?.site_name])

    return null // This is a utility component, renders nothing
}
