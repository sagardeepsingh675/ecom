import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCashfreeOrder, DEMO_MODE } from '@/lib/payment/cashfree'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Please login to continue' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            type,
            item_id,
            amount,
            original_amount,
            coupon_id,
            coupon_code,
            discount_amount
        } = body

        if (!type || !item_id || amount === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Get user details
        const { data: userData } = await supabase
            .from('users')
            .select('full_name, phone')
            .eq('id', user.id)
            .single()

        // Generate order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        console.log('Payment API - DEMO_MODE:', DEMO_MODE)
        console.log('Payment API - amount:', amount)

        if (type === 'webinar') {
            // Check if already registered
            const { data: existingReg } = await supabase
                .from('webinar_registrations')
                .select('id')
                .eq('webinar_id', item_id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (existingReg) {
                return NextResponse.json(
                    { error: 'You are already registered for this webinar' },
                    { status: 400 }
                )
            }

            // Get webinar details for return URL
            const { data: webinar } = await supabase
                .from('webinars')
                .select('slug, price')
                .eq('id', item_id)
                .single()

            // Create Cashfree order
            let cashfreeResult: any = { success: true, demoMode: true, data: {} }

            if (amount > 0) {
                console.log('Creating Cashfree order for amount:', amount)

                cashfreeResult = await createCashfreeOrder({
                    orderId,
                    orderAmount: amount,
                    customerDetails: {
                        customerId: user.id,
                        customerEmail: user.email!,
                        customerPhone: userData?.phone || '9999999999',
                        customerName: userData?.full_name || 'Customer'
                    },
                    orderMeta: {
                        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/webinar/${webinar?.slug}/success?order_id={order_id}`,
                        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/webhook`
                    },
                    orderNote: `Webinar Registration - ${item_id}`
                })

                console.log('Cashfree result:', cashfreeResult)

                if (!cashfreeResult.success) {
                    return NextResponse.json(
                        { error: cashfreeResult.error || 'Payment gateway error' },
                        { status: 500 }
                    )
                }
            }

            // Create pending registration
            const { data: registration, error: regError } = await supabase
                .from('webinar_registrations')
                .insert({
                    webinar_id: item_id,
                    user_id: user.id,
                    payment_status: amount === 0 ? 'completed' : 'pending',
                    amount_paid: amount,
                    payment_id: orderId,
                })
                .select()
                .single()

            if (regError) {
                console.error('Registration error:', regError)
                return NextResponse.json(
                    { error: `Failed to create registration: ${regError.message}` },
                    { status: 500 }
                )
            }

            // If fully discounted (free with coupon), skip payment
            if (amount === 0) {
                return NextResponse.json({
                    success: true,
                    demo_mode: true,
                    registration_id: registration.id,
                    order_id: orderId,
                    amount: 0,
                })
            }

            return NextResponse.json({
                success: true,
                demo_mode: cashfreeResult.demoMode || false,
                registration_id: registration.id,
                order_id: orderId,
                amount: amount,
                cf_order_id: cashfreeResult.data?.cfOrderId,
                payment_session_id: cashfreeResult.data?.paymentSessionId,
            })
        }

        if (type === 'service') {
            // Get service details for return URL
            const { data: service } = await supabase
                .from('services')
                .select('slug, price')
                .eq('id', item_id)
                .single()

            // Create Cashfree order
            let cashfreeResult: any = { success: true, demoMode: true, data: {} }

            if (amount > 0) {
                cashfreeResult = await createCashfreeOrder({
                    orderId,
                    orderAmount: amount,
                    customerDetails: {
                        customerId: user.id,
                        customerEmail: user.email!,
                        customerPhone: userData?.phone || '9999999999',
                        customerName: userData?.full_name || 'Customer'
                    },
                    orderMeta: {
                        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/service/${service?.slug}/success?order_id={order_id}`,
                        notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/webhook`
                    },
                    orderNote: `Service Purchase - ${item_id}`
                })

                if (!cashfreeResult.success) {
                    return NextResponse.json(
                        { error: cashfreeResult.error || 'Payment gateway error' },
                        { status: 500 }
                    )
                }
            }

            // Create pending service purchase
            const { data: purchase, error: purchaseError } = await supabase
                .from('service_purchases')
                .insert({
                    service_id: item_id,
                    user_id: user.id,
                    payment_status: amount === 0 ? 'completed' : 'pending',
                    amount_paid: amount,
                    payment_id: orderId,
                })
                .select()
                .single()

            if (purchaseError) {
                console.error('Purchase error:', purchaseError)
                return NextResponse.json(
                    { error: `Failed to create purchase: ${purchaseError.message}` },
                    { status: 500 }
                )
            }

            // If fully discounted (free with coupon), skip payment
            if (amount === 0) {
                return NextResponse.json({
                    success: true,
                    demo_mode: true,
                    purchase_id: purchase.id,
                    order_id: orderId,
                    amount: 0,
                })
            }

            return NextResponse.json({
                success: true,
                demo_mode: cashfreeResult.demoMode || false,
                purchase_id: purchase.id,
                order_id: orderId,
                amount: amount,
                cf_order_id: cashfreeResult.data?.cfOrderId,
                payment_session_id: cashfreeResult.data?.paymentSessionId,
            })
        }

        return NextResponse.json(
            { error: 'Invalid payment type' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Payment creation error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
