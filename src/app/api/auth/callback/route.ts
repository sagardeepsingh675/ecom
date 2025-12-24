import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    const supabase = await createClient()

    // Handle email confirmation & password reset (token_hash flow)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })

        if (!error) {
            // For password recovery, redirect to reset password page
            if (type === 'recovery') {
                return NextResponse.redirect(new URL('/reset-password', origin))
            }
            // For email confirmation, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard?verified=true', origin))
        }

        return NextResponse.redirect(new URL('/login?error=invalid_token', origin))
    }

    // Handle OAuth callback (code flow)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL(next, origin))
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL('/login?error=auth', origin))
}
