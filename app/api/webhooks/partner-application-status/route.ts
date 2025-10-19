import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Force this route to use Node.js runtime instead of Edge runtime
// This is required for nodemailer to work properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[Status Webhook] Received request');

  try {
    const body = await request.json();
    console.log('[Status Webhook] Parsed body:', JSON.stringify(body, null, 2));

    const { company_name, email, contact_person, status } = body.record;
    console.log('[Status Webhook] Extracted data:', { company_name, email, contact_person, status });

    // Only send emails for accepted or rejected status
    if (status !== 'approved' && status !== 'rejected') {
      console.log('[Status Webhook] Status is not approved or rejected, skipping email');
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    // Validate environment variables
    const requiredEnvVars = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? '***' : undefined,
      SMTP_ALIAS_PARTNER: process.env.SMTP_ALIAS_PARTNER,
    };
    console.log('[Status Webhook] Environment variables:', requiredEnvVars);

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value && key !== 'SMTP_PASS')
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('[Status Webhook] Missing environment variables:', missingEnvVars);
      return NextResponse.json(
        { error: 'Missing environment variables', missing: missingEnvVars },
        { status: 500 }
      );
    }

    // Create SMTP transporter
    console.log('[Status Webhook] Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[Status Webhook] Transporter created');

    // Generate email content based on status
    let emailHtml: string;
    let subject: string;

    if (status === 'approved') {
      subject = 'Welcome to the PlayCircle Family!';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Congratulations, ${contact_person}!</h2>
          <p>We're excited to inform you that your partner application has been <strong>approved</strong>!</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Company Name:</strong> ${company_name}</p>
            <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Approved</span></p>
          </div>

          <p>Welcome to the PlayCircle family! We're thrilled to have ${company_name} as our partner.</p>

          <p>You can now access your partner dashboard and start managing your services:</p>
          <p>
            <a href="https://panel.playcircleapp.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
              Access Partner Dashboard
            </a>
          </p>

          <p>If you have any questions or need assistance getting started, please don't hesitate to contact us.</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            The PlayCircle Team
          </p>
        </div>
      `;
    } else {
      // status === 'rejected'
      subject = 'Update on Your PlayCircle Partner Application';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Partner Application Update</h2>
          <p>Dear ${contact_person},</p>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
            <p>We're sorry to inform you that due to some information being invalid, we couldn't accept your application at this time.</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Company Name:</strong> ${company_name}</p>
            <p><strong>Status:</strong> <span style="color: #856404; font-weight: bold;">Not Approved</span></p>
          </div>

          <p><strong>What you can do next:</strong></p>
          <ul>
            <li>Review and update your application information</li>
            <li>Resubmit your application with corrected details</li>
            <li>Contact us for more information about the reasons for rejection</li>
          </ul>

          <p>
            <a href="https://playcircleapp.com/contact" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
              Contact Support
            </a>
          </p>

          <p>We appreciate your interest in becoming a PlayCircle partner and hope to work with you in the future.</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Best regards,<br/>
            The PlayCircle Team
          </p>
        </div>
      `;
    }

    // Send email to the applicant
    console.log('[Status Webhook] Sending email to:', email);
    const info = await transporter.sendMail({
      from: `"PlayCircle Partners" <${process.env.SMTP_ALIAS_PARTNER}>`,
      to: email,
      subject: subject,
      html: emailHtml,
    });

    console.log('[Status Webhook] Email sent successfully:', info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId, status }, { status: 200 });
  } catch (error: any) {
    console.error('[Status Webhook] Error occurred:', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to send notification',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}
