import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { priceId, partnerId } = await request.json();

    if (!priceId || !partnerId) {
      return NextResponse.json(
        { error: 'Missing priceId or partnerId' },
        { status: 400 }
      );
    }

    // Verify partner exists and is approved
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, email, company_name, status')
      .eq('id', partnerId)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    if (partner.status !== 'approved') {
      return NextResponse.json(
        { error: 'Partner must be approved to subscribe' },
        { status: 403 }
      );
    }

    // Check if partner already has a subscription
    const { data: existingSubscription } = await supabase
      .from('partner_subscriptions')
      .select('stripe_customer_id, status')
      .eq('partner_id', partnerId)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // If no customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: partner.email,
        name: partner.company_name,
        metadata: {
          partner_id: partnerId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from('partner_subscriptions')
        .insert({
          partner_id: partnerId,
          stripe_customer_id: customerId,
          status: 'incomplete',
        });
    }

    // If partner has an active subscription, redirect to portal instead
    if (existingSubscription?.status === 'active') {
      return NextResponse.json(
        { error: 'Partner already has an active subscription. Use billing portal to manage.' },
        { status: 400 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${request.headers.get('origin')}/partner/dashboard?subscription=success`,
      cancel_url: `${request.headers.get('origin')}/partner/dashboard?subscription=canceled`,
      metadata: {
        partner_id: partnerId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
