import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const body = await request.json()
        const { code, item_type, item_id, amount } = body

        if (!code) {
            return NextResponse.json(
                { error: 'Coupon code is required' },
                { status: 400 }
            )
        }

        // Get coupon
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .single()

        if (couponError || !coupon) {
            return NextResponse.json(
                { error: 'Invalid or expired coupon code' },
                { status: 400 }
            )
        }

        // Check validity period
        const now = new Date()
        if (coupon.valid_from && new Date(coupon.valid_from) > now) {
            return NextResponse.json(
                { error: 'This coupon is not yet valid' },
                { status: 400 }
            )
        }

        if (coupon.valid_until && new Date(coupon.valid_until) < now) {
            return NextResponse.json(
                { error: 'This coupon has expired' },
                { status: 400 }
            )
        }

        // Check max uses
        if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
            return NextResponse.json(
                { error: 'This coupon has reached its usage limit' },
                { status: 400 }
            )
        }

        // Check applicability
        if (item_type && coupon.applies_to !== 'all' && coupon.applies_to !== item_type) {
            return NextResponse.json(
                { error: `This coupon is only valid for ${coupon.applies_to}s` },
                { status: 400 }
            )
        }

        // Check specific items
        if (item_id && coupon.applicable_items && coupon.applicable_items.length > 0) {
            if (!coupon.applicable_items.includes(item_id)) {
                return NextResponse.json(
                    { error: 'This coupon is not valid for this item' },
                    { status: 400 }
                )
            }
        }

        // Check minimum purchase
        if (amount && coupon.min_purchase_amount && amount < coupon.min_purchase_amount) {
            return NextResponse.json(
                { error: `Minimum purchase amount is ₹${coupon.min_purchase_amount}` },
                { status: 400 }
            )
        }

        // Check user usage limit
        const { data: { user } } = await supabase.auth.getUser()

        if (user && coupon.max_uses_per_user) {
            const { count } = await supabase
                .from('coupon_usages')
                .select('*', { count: 'exact', head: true })
                .eq('coupon_id', coupon.id)
                .eq('user_id', user.id)

            if (count && count >= coupon.max_uses_per_user) {
                return NextResponse.json(
                    { error: 'You have already used this coupon' },
                    { status: 400 }
                )
            }
        }

        // Calculate discount
        let discountAmount = 0

        if (amount) {
            if (coupon.discount_type === 'percentage') {
                discountAmount = (amount * coupon.discount_value) / 100
                // Apply max discount limit for percentage
                if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                    discountAmount = coupon.max_discount_amount
                }
            } else {
                discountAmount = coupon.discount_value
            }

            // Don't let discount exceed amount
            if (discountAmount > amount) {
                discountAmount = amount
            }
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                max_discount_amount: coupon.max_discount_amount
            },
            discount_amount: discountAmount,
            final_amount: amount ? amount - discountAmount : null
        })

    } catch (error) {
        console.error('Coupon validation error:', error)
        return NextResponse.json(
            { error: 'Failed to validate coupon' },
            { status: 500 }
        )
    }
}
