import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBulkMeetingLinks } from '@/lib/email/resend'
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

        // Check if admin
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { webinar_id, meeting_link } = body

        if (!webinar_id || !meeting_link) {
            return NextResponse.json(
                { error: 'Webinar ID and meeting link are required' },
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

        // Get all confirmed registrations with user details
        const { data: registrations, error: regError } = await supabase
            .from('webinar_registrations')
            .select(`
                id,
                user:users (email, full_name)
            `)
            .eq('webinar_id', webinar_id)
            .in('payment_status', ['completed', 'free'])

        if (regError) {
            console.error('Error fetching registrations:', regError)
            return NextResponse.json(
                { error: 'Failed to fetch registrations: ' + regError.message },
                { status: 500 }
            )
        }

        // Update the webinar with the meeting link (meeting_link is on webinars table, not registrations)
        const { error: updateError } = await supabase
            .from('webinars')
            .update({ meeting_link })
            .eq('id', webinar_id)

        if (updateError) {
            console.error('Error updating meeting link:', updateError)
            return NextResponse.json(
                { error: 'Failed to update meeting link: ' + updateError.message },
                { status: 500 }
            )
        }

        // Prepare recipients for bulk email
        const recipients = registrations?.map((reg: any) => ({
            email: reg.user?.email,
            userName: reg.user?.full_name || 'User',
            webinarTitle: webinar.title,
            meetingLink: meeting_link,
            webinarDate: formatDate(webinar.webinar_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            webinarTime: formatTime(webinar.start_time),
            platform: webinar.meeting_platform === 'zoom' ? 'Zoom' : 'Google Meet',
        })).filter((r: any) => r.email) || []

        if (recipients.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Meeting links updated but no emails to send',
                emailsSent: 0
            })
        }

        // Send bulk emails
        const emailResult = await sendBulkMeetingLinks(recipients)

        return NextResponse.json({
            success: true,
            message: `Meeting links sent to ${emailResult.successful} of ${emailResult.total} registrants`,
            emailsSent: emailResult.successful,
            emailsFailed: emailResult.failed,
            totalRecipients: emailResult.total
        })

    } catch (error) {
        console.error('Bulk email error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        )
    }
}
