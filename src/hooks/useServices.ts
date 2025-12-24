'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Service } from '@/types/database'

export function useServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })

                if (error) throw error
                setServices(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch services')
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    return { services, loading, error }
}

export function useFeaturedServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchFeaturedServices = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('is_active', true)
                    .eq('is_featured', true)
                    .order('display_order', { ascending: true })

                if (error) throw error
                setServices(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch featured services')
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedServices()
    }, [])

    return { services, loading, error }
}

export function useService(slug: string) {
    const [service, setService] = useState<Service | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchService = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single()

                if (error) throw error
                setService(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch service')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchService()
        }
    }, [slug])

    return { service, loading, error }
}
