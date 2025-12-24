'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SiteSettings } from '@/types/database'

export function useSiteSettings() {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('*')
                    .single()

                if (error) throw error
                setSettings(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch settings')
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    return { settings, loading, error }
}
