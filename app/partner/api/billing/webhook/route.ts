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
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const partnerId = session.metadata?.partner_id;

  if (!partnerId) {
    console.error('No partner_id in checkout session metadata');
    return;
  }

  // Fetch the subscription to get full details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Determine plan type based on price ID
  let planType: 'monthly' | 'yearly';
  if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
    planType = 'monthly';
  } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
    planType = 'yearly';
  } else {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Upsert subscription record
  const { error } = await supabase
    .from('partner_subscriptions')
    .upsert({
      partner_id: partnerId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    }, {
      onConflict: 'partner_id'
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }

  console.log(`Subscription created for partner ${partnerId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  // Determine plan type
  let planType: 'monthly' | 'yearly';
  if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
    planType = 'monthly';
  } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
    planType = 'yearly';
  } else {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Update subscription record
  const { error } = await supabase
    .from('partner_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      plan_type: planType,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  console.log(`Subscription updated for customer ${customerId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Update subscription status to canceled
  const { error } = await supabase
    .from('partner_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }

  console.log(`Subscription canceled for customer ${customerId}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  // Fetch the subscription to get updated status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription status (in case it was past_due)
  const { error } = await supabase
    .from('partner_subscriptions')
    .update({
      status: subscription.status,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating subscription after payment:', error);
    throw error;
  }

  console.log(`Invoice payment succeeded for customer ${customerId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) return;

  // Fetch the subscription to get updated status
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription status to past_due
  const { error } = await supabase
    .from('partner_subscriptions')
    .update({
      status: subscription.status,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Error updating subscription after failed payment:', error);
    throw error;
  }

  console.log(`Invoice payment failed for customer ${customerId}`);
}
