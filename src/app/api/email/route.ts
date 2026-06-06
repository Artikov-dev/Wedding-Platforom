import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/smtp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { to, subject, text, html } = body;
  if (!to || !subject || (!text && !html)) {
    return NextResponse.json(
      { message: 'to, subject and text/html are required' },
      { status: 400 }
    );
  }

  try {
    await sendEmail({
      to,
      subject,
      text: text ?? undefined,
      html: html ?? undefined,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'artikovrozimuhammadxon@gmail.com',
    });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('SMTP send failed:', error);
    return NextResponse.json(
      { message: 'SMTP send failed', error: (error as Error).message ?? String(error) },
      { status: 500 }
    );
  }
}
