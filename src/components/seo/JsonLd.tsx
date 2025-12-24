export function WebinarJsonLd({ webinar }: { webinar: any }) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webinarpro.com'

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: webinar.title,
        description: webinar.short_description || webinar.description?.substring(0, 160),
        startDate: `${webinar.webinar_date}T${webinar.start_time}`,
        endDate: webinar.end_time ? `${webinar.webinar_date}T${webinar.end_time}` : undefined,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        location: {
            '@type': 'VirtualLocation',
            url: `${baseUrl}/webinar/${webinar.slug}`,
        },
        image: webinar.banner_url || webinar.thumbnail_url,
        organizer: {
            '@type': 'Organization',
            name: 'WebinarPro',
            url: baseUrl,
        },
        performer: webinar.host_name ? {
            '@type': 'Person',
            name: webinar.host_name,
            jobTitle: webinar.host_title,
        } : undefined,
        offers: {
            '@type': 'Offer',
            url: `${baseUrl}/webinar/${webinar.slug}/checkout`,
            price: webinar.price,
            priceCurrency: 'INR',
            availability: webinar.available_slots > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            validFrom: webinar.created_at,
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

export function ServiceJsonLd({ service }: { service: any }) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webinarpro.com'

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.short_description || service.description?.substring(0, 160),
        provider: {
            '@type': 'Organization',
            name: 'WebinarPro',
            url: baseUrl,
        },
        url: `${baseUrl}/service/${service.slug}`,
        offers: {
            '@type': 'Offer',
            price: service.price,
            priceCurrency: 'INR',
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

export function OrganizationJsonLd() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://webinarpro.com'

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'WebinarPro',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
            // Add social media URLs here
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi'],
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    )
}
