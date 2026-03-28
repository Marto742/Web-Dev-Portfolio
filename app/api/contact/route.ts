import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'edge'

const resend = new Resend(process.env.RESEND_API_KEY)
const TO = process.env.CONTACT_EMAIL ?? 'bgm89044@gmail.com'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  const { name, email, message } = (await req.json()) as {
    name?: string
    email?: string
    message?: string
  }

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 })
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  if (!message || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: TO,
      replyTo: email.trim(),
      subject: `New message from ${name.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0d0d0d;color:#F5F5F0;border-radius:8px;">
          <div style="border-bottom:1px solid #222;padding-bottom:16px;margin-bottom:24px;">
            <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#F5A623;margin:0;">
              Portfolio Contact
            </p>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#6B6B6B;width:80px;">Name</td>
              <td style="padding:8px 0;font-size:14px;color:#F5F5F0;">${name.trim()}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:12px;color:#6B6B6B;">Email</td>
              <td style="padding:8px 0;font-size:14px;color:#F5A623;">
                <a href="mailto:${email.trim()}" style="color:#F5A623;">${email.trim()}</a>
              </td>
            </tr>
          </table>

          <div style="margin-top:24px;padding:20px;background:#111;border-left:2px solid #F5A623;border-radius:4px;">
            <p style="font-size:12px;color:#6B6B6B;margin:0 0 8px;">Message</p>
            <p style="font-size:14px;color:#F5F5F0;line-height:1.7;margin:0;white-space:pre-wrap;">${message.trim()}</p>
          </div>

          <p style="margin-top:24px;font-size:11px;color:#2A2A2A;text-align:center;">
            Reply directly to this email to respond to ${name.trim()}.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
