import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { verifyPayment } from '@/lib/payment/cashfree'
import { sendBookingConfirmation } from '@/lib/email/resend'
import { formatDate, formatTime } from '@/lib/utils'
import crypto from 'crypto'

// Verify Cashfree webhook signature
function verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    const secretKey = process.env.CASHFREE_SECRET_KEY
    if (!secretKey) return false

    const signatureData = timestamp + payload
    const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureData)
        .digest('base64')

    return signature === expectedSignature
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text()
        const signature = request.headers.get('x-webhook-signature') || ''
        const timestamp = request.headers.get('x-webhook-timestamp') || ''

        // Verify signature in production
        if (process.env.CASHFREE_ENV === 'production') {
            if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
                console.error('Invalid webhook signature')
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                )
            }
        }

        const body = JSON.parse(rawBody)
        const { data, type } = body

        console.log('Cashfree webhook received:', type, data?.order?.order_id)

        // Handle payment success
        if (type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'PAYMENT_SUCCESS') {
            const orderId = data?.order?.order_id
            const cfPaymentId = data?.payment?.cf_payment_id
            const paymentAmount = data?.payment?.payment_amount

            if (!orderId) {
                return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
            }

            const supabase = await createServiceClient()

            // Find the registration or purchase with this order ID
            const { data: registration } = await supabase
                .from('webinar_registrations')
                .select(`
                    id,
                    user_id,
                    webinar_id,
                    amount,
                    users (email, full_name),
                    webinars (title, webinar_date, start_time, host_name, slug)
                `)
                .eq('payment_id', orderId)
                .single()

            if (registration) {
                // Update registration status
                await supabase
                    .from('webinar_registrations')
                    .update({
                        payment_status: 'completed',
                        transaction_id: cfPaymentId?.toString() || orderId
                    })
                    .eq('id', registration.id)

                // Decrement available slots
                const { data: webinar } = await supabase
                    .from('webinars')
                    .select('available_slots')
                    .eq('id', registration.webinar_id)
                    .single()

                if (webinar && webinar.available_slots > 0) {
                    await supabase
                        .from('webinars')
                        .update({ available_slots: webinar.available_slots - 1 })
                        .eq('id', registration.webinar_id)
                }

                // Send confirmation email
                const userData = registration.users as any
                const webinarData = registration.webinars as any

                if (userData?.email && webinarData) {
                    await sendBookingConfirmation({
                        to: userData.email,
                        userName: userData.full_name || 'User',
                        webinarTitle: webinarData.title,
                        webinarDate: formatDate(webinarData.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                        webinarTime: formatTime(webinarData.start_time),
                        hostName: webinarData.host_name || 'Host',
                        amount: paymentAmount || registration.amount || 0,
                        transactionId: cfPaymentId?.toString() || orderId,
                        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/webinars`
                    })
                }

                console.log('Registration completed for order:', orderId)
                return NextResponse.json({ success: true, type: 'webinar' })
            }

            // Check for service purchase
            const { data: purchase } = await supabase
                .from('service_purchases')
                .select('id, user_id, service_id, amount')
                .eq('payment_id', orderId)
                .single()

            if (purchase) {
                await supabase
                    .from('service_purchases')
                    .update({
                        payment_status: 'completed',
                        transaction_id: cfPaymentId?.toString() || orderId
                    })
                    .eq('id', purchase.id)

                console.log('Service purchase completed for order:', orderId)
                return NextResponse.json({ success: true, type: 'service' })
            }

            console.log('No matching record found for order:', orderId)
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
        }

        // Handle payment failure
        if (type === 'PAYMENT_FAILED_WEBHOOK' || type === 'PAYMENT_FAILED') {
            const orderId = data?.order?.order_id

            if (orderId) {
                const supabase = await createServiceClient()

                // Update registration status
                await supabase
                    .from('webinar_registrations')
                    .update({ payment_status: 'failed' })
                    .eq('payment_id', orderId)

                await supabase
                    .from('service_purchases')
                    .update({ payment_status: 'failed' })
                    .eq('payment_id', orderId)

                console.log('Payment failed for order:', orderId)
            }

            return NextResponse.json({ success: true })
        }

        // Handle other webhook types
        console.log('Unhandled webhook type:', type)
        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
