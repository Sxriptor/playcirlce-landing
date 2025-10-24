-- Create partner_subscriptions table
CREATE TABLE IF NOT EXISTS partner_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_partner_subscriptions_partner_id ON partner_subscriptions(partner_id);
CREATE INDEX idx_partner_subscriptions_stripe_customer_id ON partner_subscriptions(stripe_customer_id);
CREATE INDEX idx_partner_subscriptions_stripe_subscription_id ON partner_subscriptions(stripe_subscription_id);
CREATE INDEX idx_partner_subscriptions_status ON partner_subscriptions(status);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_subscriptions_updated_at
  BEFORE UPDATE ON partner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE partner_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Partners can only view their own subscription
CREATE POLICY "Partners can view own subscription"
  ON partner_subscriptions
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE user_id = auth.uid()
    )
  );

-- Service role can do everything (for webhook updates)
CREATE POLICY "Service role can manage all subscriptions"
  ON partner_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Add subscription_status column to partners table for quick access
ALTER TABLE partners ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'active', 'past_due', 'canceled', 'incomplete'));

-- Create index on subscription_status
CREATE INDEX IF NOT EXISTS idx_partners_subscription_status ON partners(subscription_status);

-- Function to update partner subscription_status when subscription changes
CREATE OR REPLACE FUNCTION sync_partner_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the partner's subscription_status to match the subscription status
  UPDATE partners
  SET subscription_status = NEW.status
  WHERE id = NEW.partner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically sync subscription status
CREATE TRIGGER sync_partner_subscription_status_trigger
  AFTER INSERT OR UPDATE OF status ON partner_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_partner_subscription_status();

-- Comment on table
COMMENT ON TABLE partner_subscriptions IS 'Stores partner subscription information from Stripe';
COMMENT ON COLUMN partners.subscription_status IS 'Denormalized subscription status for quick access checks';
