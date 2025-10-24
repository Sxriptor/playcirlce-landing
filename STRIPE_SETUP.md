# Stripe Integration Setup Guide

This guide will help you set up and test the Stripe integration for the PlayCircle partner subscription system.

## Features Implemented

- Monthly subscription: $99/month
- Yearly subscription: $800/year (20% savings)
- Payment wall after partner approval
- Stripe-hosted checkout
- Stripe-hosted billing portal for managing subscriptions
- Webhook handling for subscription events

## Setup Steps

### 1. Database Migration

Run the SQL migration to create the subscription tables:

```bash
# Connect to your Supabase database and run:
sql/10_create_partner_subscriptions.sql
```

This creates:
- `partner_subscriptions` table
- `subscription_status` column on `partners` table
- Automatic triggers to sync subscription status

### 2. Environment Variables

Your `.env.local` already has all the required Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://playcircleapp.com/partner/api/billing/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in `.env.local`

### 4. Test Locally with Stripe CLI

To test webhooks locally:

```bash
# Install Stripe CLI
# Windows: choco install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local dev server
stripe listen --forward-to localhost:3000/partner/api/billing/webhook

# This will give you a webhook secret like whsec_...
# Copy it to your .env.local as STRIPE_WEBHOOK_SECRET
```

### 5. Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Sign in as a partner (must have status='approved')

3. You should see the subscription paywall immediately

4. Click "Subscribe Now" to be redirected to Stripe Checkout

5. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. Complete checkout and you'll be redirected back to the dashboard

7. Verify subscription in Supabase:
   ```sql
   SELECT * FROM partner_subscriptions WHERE partner_id = '<your-partner-id>';
   ```

### 6. Test Billing Portal

1. Go to Partner Dashboard → Settings → Billing tab

2. Click "Manage Billing with Stripe"

3. You'll be redirected to Stripe's hosted billing portal where you can:
   - Update payment methods
   - View invoices
   - Cancel subscription
   - Update billing information

## API Endpoints

### POST /partner/api/billing/create-checkout-session
Creates a Stripe Checkout session for new subscriptions.

**Body:**
```json
{
  "priceId": "price_...",
  "partnerId": "uuid"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /partner/api/billing/create-portal-session
Creates a Stripe billing portal session.

**Body:**
```json
{
  "partnerId": "uuid"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

### POST /partner/api/billing/webhook
Handles Stripe webhook events (called by Stripe, not your app).

**Events handled:**
- `checkout.session.completed` - Creates subscription record
- `customer.subscription.created` - Updates subscription record
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Marks subscription as canceled
- `invoice.payment_succeeded` - Updates subscription to active
- `invoice.payment_failed` - Updates subscription to past_due

## Subscription Flow

1. Partner signs up → Creates account
2. Admin approves partner → Status = 'approved'
3. Partner signs in → Layout checks subscription status
4. If no active subscription → Shows payment wall
5. Partner clicks "Subscribe Now" → Redirected to Stripe Checkout
6. Partner completes payment → Webhook creates subscription record
7. Partner redirected back to dashboard → Can now access all features
8. Partner can manage billing → Settings → Billing → "Manage Billing with Stripe"

## Database Schema

### partner_subscriptions

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| partner_id | UUID | References partners(id) |
| stripe_customer_id | TEXT | Stripe customer ID |
| stripe_subscription_id | TEXT | Stripe subscription ID |
| plan_type | TEXT | 'monthly' or 'yearly' |
| status | TEXT | Subscription status |
| current_period_start | TIMESTAMPTZ | Billing period start |
| current_period_end | TIMESTAMPTZ | Billing period end |
| cancel_at_period_end | BOOLEAN | If cancellation scheduled |
| canceled_at | TIMESTAMPTZ | Cancellation timestamp |

### Subscription Statuses

- `active` - Subscription is active and paid
- `past_due` - Payment failed, grace period
- `canceled` - Subscription canceled
- `incomplete` - Initial payment not completed
- `incomplete_expired` - Initial payment expired
- `trialing` - In trial period (not used currently)
- `unpaid` - Payment failed, no grace period

## Production Checklist

Before going live:

- [ ] Replace test Stripe keys with live keys in `.env.local`
- [ ] Update webhook endpoint in Stripe Dashboard to production URL
- [ ] Test complete subscription flow in production
- [ ] Test webhook events are being received
- [ ] Verify billing portal works correctly
- [ ] Set up monitoring for failed payments
- [ ] Configure Stripe email notifications
- [ ] Test subscription cancellation flow
- [ ] Test subscription upgrade/downgrade (monthly ↔ yearly)

## Troubleshooting

### Paywall not showing
- Check partner status is 'approved'
- Check partner_subscriptions table exists
- Check subscription status in database

### Webhook not working
- Verify webhook secret in .env.local
- Check webhook endpoint is publicly accessible
- View webhook logs in Stripe Dashboard
- Check Next.js API logs for errors

### Billing portal button not working
- Ensure partner has a subscription record
- Check stripe_customer_id exists in database
- Verify partnerId is being passed correctly

### Subscription not updating after payment
- Check webhook is receiving events
- Verify webhook secret is correct
- Check API route logs for errors
- Verify database RLS policies allow service role access

## Support

For issues:
1. Check Stripe Dashboard logs
2. Check Next.js server logs
3. Check Supabase logs
4. Review webhook event history in Stripe
5. Test with Stripe CLI locally

## Testing Cards

Use these test cards in Stripe test mode:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0025 0000 3155 | Requires authentication |
