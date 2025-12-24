import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { email, password, full_name } = await request.json()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name,
            },
        },
    })

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        )
    }

    return NextResponse.json({
        success: true,
        message: 'Check your email to confirm your account',
        user: data.user,
    })
}
