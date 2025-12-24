import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
    const supabase = await createClient()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    // Fetch published webinars
    const { data: webinars } = await supabase
        .from('webinars')
        .select('slug, updated_at')
        .eq('status', 'published')

    const webinarPages: MetadataRoute.Sitemap = (webinars || []).map((webinar) => ({
        url: `${baseUrl}/webinar/${webinar.slug}`,
        lastModified: new Date(webinar.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Fetch active services
    const { data: services } = await supabase
        .from('services')
        .select('slug, updated_at')
        .eq('is_active', true)

    const servicePages: MetadataRoute.Sitemap = (services || []).map((service) => ({
        url: `${baseUrl}/service/${service.slug}`,
        lastModified: new Date(service.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    return [...staticPages, ...webinarPages, ...servicePages]
}
