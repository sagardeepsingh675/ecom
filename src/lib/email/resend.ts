import nodemailer from 'nodemailer'

// Configure Zoho SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.in',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({ to, subject, html, from, attachments }: SendEmailOptions) {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email not sent.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || `WebinarPro <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/pdf',
      })),
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, data: { id: info.messageId } }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

// Common email wrapper styles - accepts company name
const emailWrapper = (content: string, companyName: string = 'WebinarPro') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; padding: 40px; border-radius: 16px; margin-top: 20px; margin-bottom: 20px;">
    ${content}
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ffffff10;">
      <p style="color: #ffffff50; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`

// Email Templates
export const emailTemplates = {
  // Welcome email after signup
  welcome: (data: { userName: string; loginUrl: string }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Welcome to WebinarPro!</h1>
        </div>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Welcome to WebinarPro! We're excited to have you join our community of learners.
        </p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
          <h2 style="color: white; margin: 0 0 16px 0; font-size: 20px;">What You Can Do</h2>
          <p style="color: #ffffffdd; margin: 8px 0;">✓ Browse and register for webinars</p>
          <p style="color: #ffffffdd; margin: 8px 0;">✓ Access your personalized dashboard</p>
          <p style="color: #ffffffdd; margin: 8px 0;">✓ Get certificates after completion</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Explore Webinars
          </a>
        </div>
    `),

  // Booking confirmation
  bookingConfirmation: (data: {
    userName: string
    webinarTitle: string
    webinarDate: string
    webinarTime: string
    hostName: string
    amount: number
    transactionId?: string
    dashboardUrl: string
  }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
        </div>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Thank you for registering! Your spot for <strong style="color: #667eea;">${data.webinarTitle}</strong> has been confirmed.
        </p>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
          <h2 style="margin: 0 0 16px 0; font-size: 20px;">📅 Webinar Details</h2>
          <table style="width: 100%; color: white;">
            <tr>
              <td style="padding: 8px 0;"><strong>Title:</strong></td>
              <td style="padding: 8px 0;">${data.webinarTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Host:</strong></td>
              <td style="padding: 8px 0;">${data.hostName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Date:</strong></td>
              <td style="padding: 8px 0;">${data.webinarDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Time:</strong></td>
              <td style="padding: 8px 0;">${data.webinarTime} IST</td>
            </tr>
            ${data.amount > 0 ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
              <td style="padding: 8px 0;">₹${data.amount.toLocaleString('en-IN')}</td>
            </tr>
            ` : ''}
            ${data.transactionId ? `
            <tr>
              <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
              <td style="padding: 8px 0;">${data.transactionId}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">📬 What's Next?</h3>
          <ul style="color: #ffffffcc; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Meeting link will be shared before the session</li>
            <li>Add this event to your calendar</li>
            <li>Check your dashboard for updates</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            View in Dashboard
          </a>
        </div>
    `),

  // Meeting link notification
  meetingLink: (data: {
    userName: string
    webinarTitle: string
    meetingLink: string
    webinarDate: string
    webinarTime: string
    platform: string
  }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔗 Your Meeting Link is Ready!</h1>
        </div>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Great news! Your meeting link for <strong style="color: #10b981;">${data.webinarTitle}</strong> is now available.
        </p>
        
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white; text-align: center;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px;">Webinar Starting Soon!</h2>
          <p style="margin: 8px 0; font-size: 18px;">${data.webinarDate}</p>
          <p style="margin: 8px 0; font-size: 24px; font-weight: bold;">${data.webinarTime} IST</p>
          <p style="margin: 16px 0 0 0; opacity: 0.8;">Platform: ${data.platform}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.meetingLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 18px;">
            🎥 Join Webinar
          </a>
        </div>
        
        <p style="color: #ffffff80; font-size: 14px; text-align: center;">
          Can't click the button? Copy this link:<br>
          <a href="${data.meetingLink}" style="color: #667eea; word-break: break-all;">${data.meetingLink}</a>
        </p>
    `),

  // Webinar reminder (1 hour before)
  reminder: (data: {
    userName: string
    webinarTitle: string
    webinarTime: string
    meetingLink?: string
    dashboardUrl: string
  }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Reminder: Webinar Starting Soon!</h1>
        </div>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          This is a friendly reminder that <strong style="color: #f59e0b;">${data.webinarTitle}</strong> is starting in about 1 hour!
        </p>
        
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white; text-align: center;">
          <p style="margin: 0; font-size: 18px;">Starting at</p>
          <p style="margin: 8px 0; font-size: 32px; font-weight: bold;">${data.webinarTime} IST</p>
        </div>
        
        ${data.meetingLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.meetingLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 18px;">
            🎥 Join Webinar
          </a>
        </div>
        ` : `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Check Dashboard for Link
          </a>
        </div>
        `}
    `),

  // Contact form confirmation
  contactConfirmation: (data: { userName: string }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✉️ Message Received!</h1>
        </div>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Hi ${data.userName},
        </p>
        
        <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
          Thank you for reaching out! We've received your message and will get back to you within 24-48 hours.
        </p>
        
        <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #667eea;">
          <p style="color: #ffffffcc; margin: 0;">
            While you wait, feel free to explore our upcoming webinars and services!
          </p>
        </div>
        
        <p style="color: #ffffff80; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong style="color: #ffffffcc;">The WebinarPro Team</strong>
        </p>
    `),

  // Admin notification for new booking
  adminNewBooking: (data: {
    userName: string
    userEmail: string
    webinarTitle: string
    amount: number
    adminUrl: string
  }) => emailWrapper(`
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎟️ New Booking Received!</h1>
        </div>
        
        <div style="background: #1a1a2e; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; color: #ffffffcc;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;"><strong>Customer:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;">${data.userName}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;"><strong>Email:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;">${data.userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;"><strong>Webinar:</strong></td>
              <td style="padding: 12px 0; border-bottom: 1px solid #ffffff10;">${data.webinarTitle}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0;"><strong>Amount:</strong></td>
              <td style="padding: 12px 0; color: #10b981; font-weight: bold;">
                ${data.amount === 0 ? 'Free Registration' : `₹${data.amount.toLocaleString('en-IN')}`}
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.adminUrl}" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            View in Admin Panel
          </a>
        </div>
    `),
}

// Bulk email sender for meeting links
export async function sendBulkMeetingLinks(
  recipients: Array<{
    email: string
    userName: string
    webinarTitle: string
    meetingLink: string
    webinarDate: string
    webinarTime: string
    platform: string
  }>
) {
  const results = await Promise.allSettled(
    recipients.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject: `🔗 Your Meeting Link for ${recipient.webinarTitle}`,
        html: emailTemplates.meetingLink(recipient),
      })
    )
  )

  const successful = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return { successful, failed, total: recipients.length }
}

// Helper to send booking confirmation with optional invoice PDF
export async function sendBookingConfirmation(data: {
  to: string
  userName: string
  webinarTitle: string
  webinarDate: string
  webinarTime: string
  hostName: string
  amount: number
  transactionId?: string
  dashboardUrl: string
  invoicePdf?: Buffer
  invoiceNumber?: string
  companyName?: string
  companyEmail?: string
}) {
  const companyName = data.companyName || 'WebinarPro'

  const attachments = data.invoicePdf ? [{
    filename: `invoice-${data.invoiceNumber || 'webinar'}.pdf`,
    content: data.invoicePdf,
    contentType: 'application/pdf',
  }] : undefined

  // Create custom email with company branding
  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
    </div>
    
    <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
      Thank you for registering! Your spot for <strong style="color: #667eea;">${data.webinarTitle}</strong> has been confirmed.
    </p>
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h2 style="margin: 0 0 16px 0; font-size: 20px;">📅 Webinar Details</h2>
      <table style="width: 100%; color: white;">
        <tr>
          <td style="padding: 8px 0;"><strong>Title:</strong></td>
          <td style="padding: 8px 0;">${data.webinarTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Host:</strong></td>
          <td style="padding: 8px 0;">${data.hostName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Date:</strong></td>
          <td style="padding: 8px 0;">${data.webinarDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Time:</strong></td>
          <td style="padding: 8px 0;">${data.webinarTime} IST</td>
        </tr>
        ${data.amount > 0 ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
          <td style="padding: 8px 0;">Rs. ${data.amount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${data.transactionId ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px 0;">${data.transactionId}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #10b981;">
      <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px;">📬 What's Next?</h3>
      <ul style="color: #ffffffcc; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Meeting link will be shared before the session</li>
        <li>Add this event to your calendar</li>
        ${data.invoicePdf ? '<li>Your invoice is attached to this email</li>' : '<li>Check your dashboard for updates</li>'}
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        View in Dashboard
      </a>
    </div>
  `, companyName)

  return sendEmail({
    to: data.to,
    subject: `🎉 Booking Confirmed: ${data.webinarTitle}`,
    html,
    attachments,
  })
}

// Helper to send welcome email
export async function sendWelcomeEmail(data: {
  to: string
  userName: string
  loginUrl: string
}) {
  return sendEmail({
    to: data.to,
    subject: `🎉 Welcome to WebinarPro!`,
    html: emailTemplates.welcome(data),
  })
}

// Helper to send service purchase confirmation with optional invoice PDF
export async function sendServicePurchaseConfirmation(data: {
  to: string
  userName: string
  serviceName: string
  serviceDescription: string
  amount: number
  transactionId?: string
  dashboardUrl: string
  invoicePdf?: Buffer
  invoiceNumber?: string
  companyName?: string
}) {
  const companyName = data.companyName || 'WebinarPro'

  const html = emailWrapper(`
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Purchase Confirmed!</h1>
    </div>
    
    <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName},
    </p>
    
    <p style="color: #ffffffcc; font-size: 16px; line-height: 1.6;">
      Thank you for your purchase! Your order for <strong style="color: #10b981;">${data.serviceName}</strong> has been confirmed.
    </p>
    
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h2 style="margin: 0 0 16px 0; font-size: 20px;">📦 Order Details</h2>
      <table style="width: 100%; color: white;">
        <tr>
          <td style="padding: 8px 0;"><strong>Service:</strong></td>
          <td style="padding: 8px 0;">${data.serviceName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Description:</strong></td>
          <td style="padding: 8px 0;">${data.serviceDescription}</td>
        </tr>
        ${data.amount > 0 ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
          <td style="padding: 8px 0;">Rs. ${data.amount.toLocaleString('en-IN')}</td>
        </tr>
        ` : ''}
        ${data.transactionId ? `
        <tr>
          <td style="padding: 8px 0;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px 0;">${data.transactionId}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #667eea;">
      <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 16px;">📬 What's Next?</h3>
      <ul style="color: #ffffffcc; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>Our team will reach out within 24 hours</li>
        <li>Check your dashboard for updates</li>
        <li>Invoice is attached to this email</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.dashboardUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        View in Dashboard
      </a>
    </div>
  `, companyName)

  const attachments = data.invoicePdf ? [{
    filename: `invoice-${data.invoiceNumber || 'service'}.pdf`,
    content: data.invoicePdf,
    contentType: 'application/pdf',
  }] : undefined

  return sendEmail({
    to: data.to,
    subject: `🎉 Purchase Confirmed: ${data.serviceName}`,
    html,
    attachments,
  })
}

