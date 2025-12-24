import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBookingConfirmation, sendServicePurchaseConfirmation } from '@/lib/email/resend'
import { formatDate, formatTime } from '@/lib/utils'
import { generateInvoicePDF, generateInvoiceNumber } from '@/lib/invoice/generator'

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
        const { registration_id, purchase_id, order_id } = body

        // Fetch site settings for invoice
        const { data: siteSettings } = await supabase
            .from('site_settings')
            .select('site_name, email, phone, address, company_name, gst_enabled, gst_number, gst_rate')
            .single()

        const companyName = siteSettings?.company_name || siteSettings?.site_name || 'WebinarPro'
        const companyEmail = siteSettings?.email || 'support@webinarpro.com'
        const companyAddress = siteSettings?.address || ''
        const companyPhone = siteSettings?.phone || ''
        const gstEnabled = siteSettings?.gst_enabled || false
        const gstNumber = siteSettings?.gst_number || ''
        const gstRate = siteSettings?.gst_rate || 18

        if (registration_id) {
            // Get registration with webinar details
            const { data: registration, error: regFetchError } = await supabase
                .from('webinar_registrations')
                .select(`
                    id,
                    amount_paid,
                    webinar_id,
                    webinars (title, webinar_date, start_time, host_name, slug)
                `)
                .eq('id', registration_id)
                .eq('user_id', user.id)
                .single()

            if (regFetchError || !registration) {
                console.error('Registration fetch error:', regFetchError)
                return NextResponse.json(
                    { error: 'Registration not found' },
                    { status: 404 }
                )
            }

            // Generate invoice number
            const invoiceNumber = generateInvoiceNumber()

            // Complete webinar registration payment
            const { error: updateError } = await supabase
                .from('webinar_registrations')
                .update({
                    payment_status: 'completed',
                    payment_id: order_id,
                    invoice_number: invoiceNumber,
                })
                .eq('id', registration_id)
                .eq('user_id', user.id)

            if (updateError) {
                console.error('Update error:', updateError)
                return NextResponse.json(
                    { error: 'Failed to complete payment' },
                    { status: 500 }
                )
            }

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

            // Get user details
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, phone')
                .eq('id', user.id)
                .single()

            // Send confirmation email with invoice (non-blocking)
            const webinarData = registration.webinars as any
            if (webinarData) {
                try {
                    const totalAmount = registration.amount_paid || 0
                    const taxAmount = gstEnabled && totalAmount > 0
                        ? Math.round((totalAmount * gstRate) / (100 + gstRate) * 100) / 100
                        : 0
                    const subtotal = Math.round((totalAmount - taxAmount) * 100) / 100

                    // Generate invoice PDF
                    const invoiceData = {
                        invoiceNumber,
                        invoiceDate: formatDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric' }),
                        customerName: userData?.full_name || user.email?.split('@')[0] || 'Customer',
                        customerEmail: user.email!,
                        customerPhone: userData?.phone,
                        items: [{
                            description: `Webinar Registration: ${webinarData.title}`,
                            details: `Date: ${formatDate(webinarData.webinar_date, { month: 'long', day: 'numeric', year: 'numeric' })} | Host: ${webinarData.host_name}`,
                            quantity: 1,
                            unitPrice: subtotal,
                            total: subtotal,
                        }],
                        subtotal,
                        tax: taxAmount,
                        taxRate: gstRate,
                        total: totalAmount,
                        transactionId: order_id,
                        paymentMethod: 'Online Payment',
                        isPaid: true,
                        companyName,
                        companyEmail,
                        companyAddress,
                        companyPhone,
                        gstEnabled,
                        gstNumber,
                    }

                    const pdfBuffer = await generateInvoicePDF(invoiceData)

                    sendBookingConfirmation({
                        to: user.email!,
                        userName: userData?.full_name || user.email?.split('@')[0] || 'User',
                        webinarTitle: webinarData.title,
                        webinarDate: formatDate(webinarData.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
                        webinarTime: formatTime(webinarData.start_time),
                        hostName: webinarData.host_name || 'Host',
                        amount: registration.amount_paid || 0,
                        transactionId: order_id,
                        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/webinars`,
                        invoicePdf: Buffer.from(pdfBuffer),
                        invoiceNumber,
                        companyName,
                    }).catch(err => console.error('Email send error:', err))
                } catch (emailErr) {
                    console.error('Email/Invoice error:', emailErr)
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Payment completed successfully',
            })
        }

        if (purchase_id) {
            // Get purchase with service details
            const { data: purchase, error: purchaseFetchError } = await supabase
                .from('service_purchases')
                .select(`
                    id,
                    amount_paid,
                    services (name, short_description)
                `)
                .eq('id', purchase_id)
                .eq('user_id', user.id)
                .single()

            if (purchaseFetchError || !purchase) {
                console.error('Purchase fetch error:', purchaseFetchError)
                return NextResponse.json(
                    { error: 'Purchase not found' },
                    { status: 404 }
                )
            }

            // Generate invoice number
            const invoiceNumber = generateInvoiceNumber()

            // Complete service purchase payment
            const { error: updateError } = await supabase
                .from('service_purchases')
                .update({
                    payment_status: 'completed',
                    payment_id: order_id,
                    invoice_number: invoiceNumber,
                })
                .eq('id', purchase_id)
                .eq('user_id', user.id)

            if (updateError) {
                console.error('Update error:', updateError)
                return NextResponse.json(
                    { error: 'Failed to complete payment' },
                    { status: 500 }
                )
            }

            // Get user details
            const { data: userData } = await supabase
                .from('users')
                .select('full_name, phone')
                .eq('id', user.id)
                .single()

            // Send confirmation email with invoice (non-blocking)
            const serviceData = purchase.services as any
            if (serviceData) {
                try {
                    const totalAmount = purchase.amount_paid || 0
                    const taxAmount = gstEnabled && totalAmount > 0
                        ? Math.round((totalAmount * gstRate) / (100 + gstRate) * 100) / 100
                        : 0
                    const subtotal = Math.round((totalAmount - taxAmount) * 100) / 100

                    // Generate invoice PDF
                    const invoiceData = {
                        invoiceNumber,
                        invoiceDate: formatDate(new Date().toISOString(), { month: 'long', day: 'numeric', year: 'numeric' }),
                        customerName: userData?.full_name || user.email?.split('@')[0] || 'Customer',
                        customerEmail: user.email!,
                        customerPhone: userData?.phone,
                        items: [{
                            description: serviceData.name || 'Service',
                            details: serviceData.short_description || '',
                            quantity: 1,
                            unitPrice: subtotal,
                            total: subtotal,
                        }],
                        subtotal,
                        tax: taxAmount,
                        taxRate: gstRate,
                        total: totalAmount,
                        transactionId: order_id,
                        paymentMethod: 'Online Payment',
                        isPaid: true,
                        companyName,
                        companyEmail,
                        companyAddress,
                        companyPhone,
                        gstEnabled,
                        gstNumber,
                    }

                    const pdfBuffer = await generateInvoicePDF(invoiceData)

                    sendServicePurchaseConfirmation({
                        to: user.email!,
                        userName: userData?.full_name || user.email?.split('@')[0] || 'User',
                        serviceName: serviceData.name,
                        serviceDescription: serviceData.short_description || '',
                        amount: purchase.amount_paid || 0,
                        transactionId: order_id,
                        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/services`,
                        invoicePdf: Buffer.from(pdfBuffer),
                        invoiceNumber,
                        companyName,
                    }).catch(err => console.error('Email send error:', err))
                } catch (emailErr) {
                    console.error('Email/Invoice error:', emailErr)
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Payment completed successfully',
            })
        }

        return NextResponse.json(
            { error: 'Missing registration or purchase ID' },
            { status: 400 }
        )

    } catch (error) {
        console.error('Payment completion error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
