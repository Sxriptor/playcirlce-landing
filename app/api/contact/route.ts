import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Force this route to use Node.js runtime instead of Edge runtime
// This is required for nodemailer to work properly
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Type for support ticket help types
type SupportHelpType = 'partnership' | 'general_inquiry' | 'feedback' | 'other';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  helpType: SupportHelpType;
  message: string;
}

export async function POST(request: NextRequest) {
  console.log('[Contact Form] Received request');

  try {
    const body: ContactFormData = await request.json();
    console.log('[Contact Form] Parsed body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const { firstName, lastName, email, phone, helpType, message } = body;

    if (!firstName || !lastName || !email || !phone || !helpType || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate help type
    const validHelpTypes: SupportHelpType[] = ['partnership', 'general_inquiry', 'feedback', 'other'];
    if (!validHelpTypes.includes(helpType)) {
      return NextResponse.json(
        { error: 'Invalid help type' },
        { status: 400 }
      );
    }

    // Validate environment variables for Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Contact Form] Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Insert the support ticket into the database
    console.log('[Contact Form] Inserting support ticket into database...');
    const { data: ticket, error: dbError } = await supabase
      .from('support_tickets')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          help_type: helpType,
          message: message,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('[Contact Form] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save support ticket', details: dbError.message },
        { status: 500 }
      );
    }

    console.log('[Contact Form] Support ticket saved:', ticket.id);

    // Validate environment variables for SMTP
    const requiredEnvVars = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS ? '***' : undefined,
      SMTP_ALIAS_SUPPORT: process.env.SMTP_ALIAS_SUPPORT,
      SMTP_SUPPORT_EMAIL: process.env.SMTP_SUPPORT_EMAIL,
    };
    console.log('[Contact Form] Environment variables:', requiredEnvVars);

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value && key !== 'SMTP_PASS')
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('[Contact Form] Missing SMTP environment variables:', missingEnvVars);
      // Still return success since the ticket was saved, but log the email error
      return NextResponse.json(
        {
          success: true,
          ticketId: ticket.id,
          warning: 'Support ticket saved but email notification failed to send'
        },
        { status: 200 }
      );
    }

    // Create SMTP transporter
    console.log('[Contact Form] Creating SMTP transporter...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[Contact Form] Transporter created');

    // Format help type for display
    const helpTypeDisplay = helpType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Email to support team
    const supportEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #456882;">New Support Ticket Received</h2>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Ticket ID:</strong> ${ticket.id}</p>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Type:</strong> ${helpTypeDisplay}</p>
          <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #456882; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This ticket will automatically expire in 7 days.
        </p>
      </div>
    `;

    // Email to user (confirmation)
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #456882;">Thank You for Contacting PlayCircle</h2>
        <p>Hi ${firstName},</p>

        <p>We've received your message and will get back to you as soon as possible.</p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Your Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reference ID:</strong> ${ticket.id}</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please keep this ID for your records.</p>
        </div>

        <p>Our support team typically responds within 24-48 hours during business days.</p>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br/>
          The PlayCircle Team
        </p>
      </div>
    `;

    // Send email to support team
    console.log('[Contact Form] Sending email to support team...');
    await transporter.sendMail({
      from: `"PlayCircle Support" <${process.env.SMTP_ALIAS_SUPPORT}>`,
      to: process.env.SMTP_SUPPORT_EMAIL,
      replyTo: email,
      subject: `New Support Ticket: ${helpTypeDisplay} - ${firstName} ${lastName}`,
      html: supportEmailHtml,
    });

    // Send confirmation email to user
    console.log('[Contact Form] Sending confirmation email to user...');
    await transporter.sendMail({
      from: `"PlayCircle Support" <${process.env.SMTP_ALIAS_SUPPORT}>`,
      to: email,
      subject: 'We received your message - PlayCircle Support',
      html: userEmailHtml,
    });

    console.log('[Contact Form] Emails sent successfully');
    return NextResponse.json(
      {
        success: true,
        ticketId: ticket.id,
        message: 'Your message has been received. Check your email for confirmation.'
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[Contact Form] Error occurred:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json(
      {
        error: 'Failed to process contact form',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
