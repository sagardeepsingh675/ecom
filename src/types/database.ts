// Database type definitions for TypeScript
// These types match the Supabase schema

export type UserRole = 'user' | 'admin'
export type WebinarStatus = 'draft' | 'published' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type FulfillmentStatus = 'pending' | 'in_progress' | 'completed'
export type MeetingPlatform = 'zoom' | 'google_meet'

export interface SiteSettings {
    id: string
    site_name: string
    site_description: string | null
    logo_url: string | null
    favicon_url: string | null
    email: string | null
    phone: string | null
    address: string | null
    facebook_url: string | null
    twitter_url: string | null
    instagram_url: string | null
    linkedin_url: string | null
    youtube_url: string | null
    cashfree_app_id: string | null
    cashfree_secret_key: string | null
    cashfree_environment: 'sandbox' | 'production'
    created_at: string
    updated_at: string
}

export interface User {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    avatar_url: string | null
    role: UserRole
    created_at: string
    updated_at: string
}

export interface Webinar {
    id: string
    title: string
    slug: string
    description: string | null
    short_description: string | null
    price: number
    original_price: number | null
    total_slots: number
    available_slots: number
    webinar_date: string
    start_time: string
    end_time: string | null
    timezone: string
    host_name: string | null
    host_title: string | null
    host_image_url: string | null
    host_bio: string | null
    thumbnail_url: string | null
    banner_url: string | null
    meeting_link: string | null
    meeting_password: string | null
    meeting_platform: MeetingPlatform
    status: WebinarStatus
    is_featured: boolean
    created_at: string
    updated_at: string
}

export interface WebinarRegistration {
    id: string
    user_id: string
    webinar_id: string
    amount_paid: number
    payment_status: PaymentStatus
    payment_id: string | null
    payment_method: string | null
    invoice_number: string | null
    invoice_url: string | null
    meeting_link_sent: boolean
    meeting_link_sent_at: string | null
    registered_at: string
    updated_at: string
    // Relations
    webinar?: Webinar
    user?: User
}

export interface Service {
    id: string
    name: string
    slug: string
    description: string | null
    short_description: string | null
    price: number
    original_price: number | null
    features: string[]
    icon_url: string | null
    image_url: string | null
    is_active: boolean
    is_featured: boolean
    display_order: number
    created_at: string
    updated_at: string
}

export interface ServicePurchase {
    id: string
    user_id: string
    service_id: string
    amount_paid: number
    payment_status: PaymentStatus
    payment_id: string | null
    payment_method: string | null
    invoice_number: string | null
    invoice_url: string | null
    fulfillment_status: FulfillmentStatus
    fulfillment_notes: string | null
    purchased_at: string
    updated_at: string
    // Relations
    service?: Service
    user?: User
}

export interface ContactLead {
    id: string
    name: string
    email: string
    phone: string | null
    subject: string | null
    message: string
    is_read: boolean
    read_at: string | null
    read_by: string | null
    admin_notes: string | null
    created_at: string
}

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            site_settings: {
                Row: SiteSettings
                Insert: Partial<SiteSettings>
                Update: Partial<SiteSettings>
            }
            users: {
                Row: User
                Insert: Partial<User> & { id: string; email: string }
                Update: Partial<User>
            }
            webinars: {
                Row: Webinar
                Insert: Partial<Webinar> & { title: string; slug: string; webinar_date: string; start_time: string }
                Update: Partial<Webinar>
            }
            webinar_registrations: {
                Row: WebinarRegistration
                Insert: Partial<WebinarRegistration> & { user_id: string; webinar_id: string; amount_paid: number }
                Update: Partial<WebinarRegistration>
            }
            services: {
                Row: Service
                Insert: Partial<Service> & { name: string; slug: string; price: number }
                Update: Partial<Service>
            }
            service_purchases: {
                Row: ServicePurchase
                Insert: Partial<ServicePurchase> & { user_id: string; service_id: string; amount_paid: number }
                Update: Partial<ServicePurchase>
            }
            contact_leads: {
                Row: ContactLead
                Insert: Partial<ContactLead> & { name: string; email: string; message: string }
                Update: Partial<ContactLead>
            }
        }
        Functions: {
            is_admin: {
                Args: Record<string, never>
                Returns: boolean
            }
        }
    }
}
