'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Webinar } from '@/types/database'

export function useWebinars() {
    const [webinars, setWebinars] = useState<Webinar[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('webinars')
                    .select('*')
                    .eq('status', 'published')
                    .order('webinar_date', { ascending: true })

                if (error) throw error
                setWebinars(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch webinars')
            } finally {
                setLoading(false)
            }
        }

        fetchWebinars()
    }, [])

    return { webinars, loading, error }
}

export function useFeaturedWebinar() {
    const [webinar, setWebinar] = useState<Webinar | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFeaturedWebinar = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('webinars')
                    .select('*')
                    .eq('status', 'published')
                    .eq('is_featured', true)
                    .order('webinar_date', { ascending: true })
                    .limit(1)
                    .single()

                if (error && error.code !== 'PGRST116') throw error
                setWebinar(data || null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch featured webinar')
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedWebinar()
    }, [])

    return { webinar, loading, error }
}

export function useWebinar(slug: string) {
    const [webinar, setWebinar] = useState<Webinar | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchWebinar = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('webinars')
                    .select('*')
                    .eq('slug', slug)
                    .eq('status', 'published')
                    .single()

                if (error) throw error
                setWebinar(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch webinar')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchWebinar()
        }
    }, [slug])

    return { webinar, loading, error }
}
