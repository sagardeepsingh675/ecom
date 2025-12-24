import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF, generateInvoiceNumber } from '@/lib/invoice/generator'
import { formatDate } from '@/lib/utils'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const registrationId = searchParams.get('registration_id')
        const purchaseId = searchParams.get('purchase_id')

        if (!registrationId && !purchaseId) {
            return NextResponse.json(
                { error: 'Registration ID or Purchase ID is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch site settings for company details and GST
        const { data: siteSettings } = await supabase
            .from('site_settings')
            .select('site_name, email, phone, address, company_name, gst_enabled, gst_number, gst_rate, logo_url')
            .single()

        const companyName = siteSettings?.company_name || siteSettings?.site_name || 'WebinarPro'
        const companyEmail = siteSettings?.email || 'support@webinarpro.com'
        const companyAddress = siteSettings?.address || ''
        const companyPhone = siteSettings?.phone || ''
        const gstEnabled = siteSettings?.gst_enabled || false
        const gstNumber = siteSettings?.gst_number || ''
        const gstRate = siteSettings?.gst_rate || 18

        let invoiceData: any = null

        if (registrationId) {
            // Get webinar registration details
            const { data: registration, error } = await supabase
                .from('webinar_registrations')
                .select(`
                    id,
                    amount_paid,
                    payment_status,
                    payment_id,
                    registered_at,
                    invoice_number,
                    users (email, full_name, phone),
                    webinars (title, webinar_date, host_name)
                `)
                .eq('id', registrationId)
                .eq('user_id', user.id)
                .single()

            if (error || !registration) {
                console.error('Registration fetch error:', error)
                return NextResponse.json(
                    { error: 'Registration not found' },
                    { status: 404 }
                )
            }

            if (!['completed', 'free'].includes(registration.payment_status)) {
                return NextResponse.json(
                    { error: 'Invoice only available for completed payments' },
                    { status: 400 }
                )
            }

            const userData = registration.users as any
            const webinarData = registration.webinars as any

            // Generate or get invoice number
            let invoiceNumber = registration.invoice_number
            if (!invoiceNumber) {
                invoiceNumber = generateInvoiceNumber()
                await supabase
                    .from('webinar_registrations')
                    .update({ invoice_number: invoiceNumber })
                    .eq('id', registrationId)
            }

            const totalAmount = registration.amount_paid || 0
            // Calculate tax from inclusive price: Tax = (Total * Rate) / (100 + Rate)
            const taxAmount = gstEnabled && totalAmount > 0
                ? Math.round((totalAmount * gstRate) / (100 + gstRate) * 100) / 100
                : 0
            const subtotal = Math.round((totalAmount - taxAmount) * 100) / 100

            invoiceData = {
                invoiceNumber,
                invoiceDate: formatDate(registration.registered_at, { month: 'long', day: 'numeric', year: 'numeric' }),
                customerName: userData?.full_name || 'Customer',
                customerEmail: userData?.email || user.email,
                customerPhone: userData?.phone,
                items: [
                    {
                        description: `Webinar Registration: ${webinarData?.title}`,
                        details: `Date: ${formatDate(webinarData?.webinar_date, { month: 'long', day: 'numeric', year: 'numeric' })} | Host: ${webinarData?.host_name}`,
                        quantity: 1,
                        unitPrice: subtotal,
                        total: subtotal,
                    }
                ],
                subtotal,
                tax: taxAmount,
                taxRate: gstRate,
                total: totalAmount,
                transactionId: registration.payment_id,
                paymentMethod: registration.payment_status === 'free' ? 'Free Registration' : 'Online Payment',
                isPaid: true,
                companyName,
                companyEmail,
                companyAddress,
                companyPhone,
                gstEnabled,
                gstNumber,
            }
        }

        if (purchaseId) {
            // Get service purchase details
            const { data: purchase, error } = await supabase
                .from('service_purchases')
                .select(`
                    id,
                    amount_paid,
                    payment_status,
                    payment_id,
                    purchased_at,
                    invoice_number,
                    users (email, full_name, phone),
                    services (name, short_description)
                `)
                .eq('id', purchaseId)
                .eq('user_id', user.id)
                .single()

            if (error || !purchase) {
                console.error('Purchase fetch error:', error)
                return NextResponse.json(
                    { error: 'Purchase not found' },
                    { status: 404 }
                )
            }

            if (purchase.payment_status !== 'completed') {
                return NextResponse.json(
                    { error: 'Invoice only available for completed payments' },
                    { status: 400 }
                )
            }

            const userData = purchase.users as any
            const serviceData = purchase.services as any

            let invoiceNumber = purchase.invoice_number
            if (!invoiceNumber) {
                invoiceNumber = generateInvoiceNumber()
                await supabase
                    .from('service_purchases')
                    .update({ invoice_number: invoiceNumber })
                    .eq('id', purchaseId)
            }

            const totalAmount = purchase.amount_paid || 0
            // Calculate tax from inclusive price
            const taxAmount = gstEnabled && totalAmount > 0
                ? Math.round((totalAmount * gstRate) / (100 + gstRate) * 100) / 100
                : 0
            const subtotal = Math.round((totalAmount - taxAmount) * 100) / 100

            invoiceData = {
                invoiceNumber,
                invoiceDate: formatDate(purchase.purchased_at, { month: 'long', day: 'numeric', year: 'numeric' }),
                customerName: userData?.full_name || 'Customer',
                customerEmail: userData?.email || user.email,
                customerPhone: userData?.phone,
                items: [
                    {
                        description: serviceData?.name || 'Service',
                        details: serviceData?.short_description || '',
                        quantity: 1,
                        unitPrice: subtotal,
                        total: subtotal,
                    }
                ],
                subtotal,
                tax: taxAmount,
                taxRate: gstRate,
                total: totalAmount,
                transactionId: purchase.payment_id,
                paymentMethod: 'Online Payment',
                isPaid: true,
                companyName,
                companyEmail,
                companyAddress,
                companyPhone,
                gstEnabled,
                gstNumber,
            }
        }

        if (!invoiceData) {
            return NextResponse.json(
                { error: 'Could not generate invoice' },
                { status: 500 }
            )
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoiceData)

        // Return PDF
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
            },
        })

    } catch (error) {
        console.error('Invoice generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate invoice' },
            { status: 500 }
        )
    }
}
