import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyPayment } from '@/lib/payment/cashfree'
import { sendBookingConfirmation, sendServicePurchaseConfirmation } from '@/lib/email/resend'
import { formatDate, formatTime } from '@/lib/utils'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { order_id } = body

        if (!order_id) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            )
        }

        console.log('Verifying payment for order:', order_id)

        // Verify payment with Cashfree
        const verification = await verifyPayment(order_id)
        console.log('Payment verification result:', verification)

        if (!verification.success) {
            return NextResponse.json(
                { error: verification.error || 'Payment verification failed' },
                { status: 400 }
            )
        }

        // Check if payment was successful
        const isPaid = verification.data?.orderStatus === 'PAID' ||
            verification.data?.paymentStatus === 'SUCCESS' ||
            verification.demoMode // Demo mode is always successful

        if (!isPaid) {
            return NextResponse.json(
                { error: 'Payment not completed', status: verification.data?.orderStatus },
                { status: 400 }
            )
        }

        // Find the registration with this order ID (stored as payment_id)
        const { data: registration, error: regError } = await supabase
            .from('webinar_registrations')
            .select(`
                id,
                user_id,
                payment_status,
                amount_paid,
                webinar_id,
                webinars (title, webinar_date, start_time, host_name, slug, available_slots)
            `)
            .eq('payment_id', order_id)
            .eq('user_id', user.id)
            .single()

        if (regError || !registration) {
            // Maybe it's a service purchase
            const { data: purchase, error: purchaseError } = await supabase
                .from('service_purchases')
                .select(`
                    id, 
                    user_id, 
                    payment_status,
                    amount_paid,
                    service_id,
                    services (name, short_description, slug)
                `)
                .eq('payment_id', order_id)
                .eq('user_id', user.id)
                .single()

            if (purchaseError || !purchase) {
                console.error('Registration/purchase not found for order:', order_id)
                return NextResponse.json(
                    { error: 'Registration not found' },
                    { status: 404 }
                )
            }

            // Update service purchase
            if (purchase.payment_status !== 'completed') {
                await supabase
                    .from('service_purchases')
                    .update({ payment_status: 'completed' })
                    .eq('id', purchase.id)

                // Get user details for email
                const { data: userData } = await supabase
                    .from('users')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()

                // Send service purchase confirmation email
                const serviceData = purchase.services as any
                if (serviceData) {
                    try {
                        sendServicePurchaseConfirmation({
                            to: user.email!,
                            userName: userData?.full_name || user.email?.split('@')[0] || 'User',
                            serviceName: serviceData.name,
                            serviceDescription: serviceData.short_description || '',
                            amount: purchase.amount_paid || 0,
                            transactionId: order_id,
                            dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/services`
                        }).catch(err => console.error('Email send error:', err))
                    } catch (emailErr) {
                        console.error('Email error:', emailErr)
                    }
                }

                console.log('Payment completed successfully for purchase:', purchase.id)
            }

            return NextResponse.json({ success: true, type: 'service', purchase_id: purchase.id })
        }

        // Update webinar registration if not already completed
        if (registration.payment_status !== 'completed') {
            const { error: updateError } = await supabase
                .from('webinar_registrations')
                .update({ payment_status: 'completed' })
                .eq('id', registration.id)

            if (updateError) {
                console.error('Failed to update registration:', updateError)
                return NextResponse.json(
                    { error: 'Failed to update registration' },
                    { status: 500 }
                )
            }

            // Decrement available slots
            const webinarData = registration.webinars as any
            if (webinarData && webinarData.available_slots > 0) {
                await supabase
                    .from('webinars')
                    .update({ available_slots: webinarData.available_slots - 1 })
                    .eq('id', registration.webinar_id)
            }

            // Get user details for email
            const { data: userData } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single()

            // Send confirmation email (non-blocking)
            if (webinarData) {
                try {
                    sendBookingConfirmation({
                        to: user.email!,
                        userName: userData?.full_name || user.email?.split('@')[0] || 'User',
                        webinarTitle: webinarData.title,
                        webinarDate: formatDate(webinarData.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                        webinarTime: formatTime(webinarData.start_time),
                        hostName: webinarData.host_name || 'Host',
                        amount: registration.amount_paid || 0,
                        transactionId: order_id,
                        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/webinars`
                    }).catch(err => console.error('Email send error:', err))
                } catch (emailErr) {
                    console.error('Email error:', emailErr)
                }
            }

            console.log('Payment completed successfully for registration:', registration.id)
        }

        return NextResponse.json({
            success: true,
            type: 'webinar',
            registration_id: registration.id,
            already_completed: registration.payment_status === 'completed'
        })

    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
