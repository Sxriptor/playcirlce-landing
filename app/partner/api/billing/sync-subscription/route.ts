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
    const { partnerId } = await request.json();

    if (!partnerId) {
      return NextResponse.json(
        { error: 'Missing partnerId' },
        { status: 400 }
      );
    }

    // Get partner's subscription from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('partner_subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('partner_id', partnerId)
      .single();

    if (dbError || !dbSubscription) {
      return NextResponse.json(
        { error: 'No subscription found in database' },
        { status: 404 }
      );
    }

    // If we have a subscription ID, fetch from Stripe
    if (dbSubscription.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(
        dbSubscription.stripe_subscription_id
      );

      const priceId = subscription.items.data[0].price.id;

      // Determine plan type
      let planType: 'monthly' | 'yearly';
      if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
        planType = 'monthly';
      } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
        planType = 'yearly';
      } else {
        return NextResponse.json(
          { error: 'Unknown price ID' },
          { status: 400 }
        );
      }

      // Update database with Stripe data
      const { error: updateError } = await supabase
        .from('partner_subscriptions')
        .update({
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        })
        .eq('partner_id', partnerId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: subscription.status,
        message: 'Subscription synced successfully',
      });
    }

    // If no subscription ID, check if customer has any subscriptions
    if (dbSubscription.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: dbSubscription.stripe_customer_id,
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0];
        const priceId = subscription.items.data[0].price.id;

        let planType: 'monthly' | 'yearly';
        if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) {
          planType = 'monthly';
        } else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) {
          planType = 'yearly';
        } else {
          return NextResponse.json(
            { error: 'Unknown price ID' },
            { status: 400 }
          );
        }

        // Update with subscription data
        const { error: updateError } = await supabase
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
          .eq('partner_id', partnerId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          status: subscription.status,
          message: 'Subscription found and synced',
        });
      }
    }

    return NextResponse.json(
      { error: 'No active subscription found in Stripe' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
