import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation } from '@/lib/email/resend'
import { formatDate, formatTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Please login to register' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { webinar_id } = body

        if (!webinar_id) {
            return NextResponse.json(
                { error: 'Webinar ID is required' },
                { status: 400 }
            )
        }

        // Get webinar details
        const { data: webinar, error: webinarError } = await supabase
            .from('webinars')
            .select('*')
            .eq('id', webinar_id)
            .single()

        if (webinarError || !webinar) {
            return NextResponse.json(
                { error: 'Webinar not found' },
                { status: 404 }
            )
        }

        // Check if already registered
        const { data: existingReg } = await supabase
            .from('webinar_registrations')
            .select('id')
            .eq('webinar_id', webinar_id)
            .eq('user_id', user.id)
            .single()

        if (existingReg) {
            return NextResponse.json(
                { error: 'You are already registered for this webinar' },
                { status: 400 }
            )
        }

        // Check available slots
        if (webinar.available_slots <= 0) {
            return NextResponse.json(
                { error: 'Sorry, this webinar is sold out' },
                { status: 400 }
            )
        }

        // Get user details
        const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const userName = userData?.full_name || user.email?.split('@')[0] || 'User'

        // For free webinars, register directly
        if (webinar.price === 0) {
            const { data: registration, error: regError } = await supabase
                .from('webinar_registrations')
                .insert({
                    webinar_id: webinar_id,
                    user_id: user.id,
                    payment_status: 'free',
                    amount: 0,
                })
                .select()
                .single()

            if (regError) {
                console.error('Registration error:', regError)
                return NextResponse.json(
                    { error: 'Failed to register. Please try again.' },
                    { status: 500 }
                )
            }

            // Send confirmation email (don't wait, do async)
            sendBookingConfirmation({
                to: user.email!,
                userName,
                webinarTitle: webinar.title,
                webinarDate: formatDate(webinar.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                webinarTime: formatTime(webinar.start_time),
                hostName: webinar.host_name || 'Host',
                amount: 0,
                dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/webinars`
            }).catch(err => console.error('Email send error:', err))

            return NextResponse.json({
                success: true,
                registration_id: registration.id,
                message: 'Successfully registered for the webinar!'
            })
        }

        // For paid webinars, create pending registration
        const { data: registration, error: regError } = await supabase
            .from('webinar_registrations')
            .insert({
                webinar_id: webinar_id,
                user_id: user.id,
                payment_status: 'pending',
                amount: webinar.price,
            })
            .select()
            .single()

        if (regError) {
            console.error('Registration error:', regError)
            return NextResponse.json(
                { error: 'Failed to create registration. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            registration_id: registration.id,
            amount: webinar.price,
            requires_payment: true
        })

    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}

