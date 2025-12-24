import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()

        const { name, email, phone, subject, message } = body

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Insert contact lead
        const { data, error } = await supabase
            .from('contact_leads')
            .insert({
                name,
                email,
                phone: phone || null,
                subject: subject || null,
                message,
            })
            .select()
            .single()

        if (error) {
            console.error('Contact form error:', error)
            return NextResponse.json(
                { error: 'Failed to submit message' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Thank you! Your message has been received.',
            data: { id: data.id }
        })
    } catch (error) {
        console.error('Contact form exception:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}
