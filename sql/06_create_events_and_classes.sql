-- Combined Events and Classes SQL
-- This file creates tables for both partner-hosted events/classes and mobile app event types
-- Combines functionality from 06_create_events.sql and 06mobileevents.sql

-- Sport formats configuration table
-- Defines official formats for each sport (singles, doubles, team sizes, etc.)
CREATE TABLE IF NOT EXISTS public.sport_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport TEXT NOT NULL CHECK (sport IN ('tennis', 'padel', 'pickleball', 'squash', 'racquetball', 'badminton', 'table_tennis', 'basketball', 'volleyball')),
    format_name TEXT NOT NULL, -- e.g., 'Singles', 'Doubles', '2v2', '3v3', '5v5', 'Indoor 6v6', 'Beach 2v2'
    format_type TEXT NOT NULL, -- e.g., 'singles', 'doubles', 'team'
    participant_count INTEGER NOT NULL, -- Total number of participants (2 for singles, 4 for doubles, etc.)
    team_size INTEGER, -- Size per team if applicable (e.g., 2 for 2v2)
    is_preferred BOOLEAN DEFAULT false, -- Mark preferred format for the sport
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0, -- Order to display in UI
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(sport, format_name)
);

-- Update the sport check constraint if the table already exists (to add padel support)
DO $$
BEGIN
    -- Drop the old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sport_formats_sport_check' 
        AND table_name = 'sport_formats'
    ) THEN
        ALTER TABLE sport_formats DROP CONSTRAINT sport_formats_sport_check;
    END IF;
    
    -- Add the updated constraint with padel
    ALTER TABLE sport_formats ADD CONSTRAINT sport_formats_sport_check 
        CHECK (sport IN ('padel', 'tennis', 'pickleball', 'squash', 'racquetball', 'badminton', 'table_tennis', 'basketball', 'volleyball'));
EXCEPTION
    WHEN OTHERS THEN
        -- Constraint might already be correct, ignore error
        NULL;
END $$;

-- Event types lookup table for mobile app
CREATE TABLE IF NOT EXISTS public.event_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    points_multiplier DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events table: Partner-hosted events, classes, and clinics
-- Includes lessons, tournaments, social events, etc.
-- Unified structure supporting both partner portal and mobile app
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL, -- Optional specific court

  -- Sport MUST be selected first (drives format options)
  sport TEXT NOT NULL CHECK (sport IN ('tennis', 'padel', 'pickleball', 'squash', 'racquetball', 'badminton', 'table_tennis', 'basketball', 'volleyball')),
  sport_id TEXT REFERENCES public.sports(id) ON DELETE CASCADE,

  -- Sport format (dynamically populated based on sport selection)
  sport_format_id UUID REFERENCES public.sport_formats(id),
  match_format TEXT, -- e.g., 'Singles', 'Doubles', '2v2', '5v5', 'Indoor 6v6', 'Beach 2v2'

  -- Event type (dynamically filtered based on sport)
  event_type TEXT NOT NULL CHECK (event_type IN ('lesson', 'clinic', 'tournament', 'social', 'camp', 'workshop', 'class', 'match', 'league')),
  event_type_id TEXT REFERENCES public.event_types(id),

  -- Mobile app specific fields
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event details
  name TEXT NOT NULL,
  title TEXT, -- Alias for mobile app compatibility
  description TEXT,

  -- Instructor/organizer info
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_credentials TEXT,

  -- Scheduling
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  start_timestamp TIMESTAMP WITH TIME ZONE, -- For mobile app compatibility
  end_timestamp TIMESTAMP WITH TIME ZONE, -- For mobile app compatibility
  timezone TEXT DEFAULT 'UTC',

  -- Recurrence for ongoing classes
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- 'weekly', 'daily', 'monthly'
  recurrence_end_date DATE,

  -- Participation and pricing
  capacity INTEGER NOT NULL,
  max_participants INTEGER, -- Alias for mobile app
  current_registrations INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0, -- Alias for mobile app
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  early_bird_price DECIMAL(10, 2),
  early_bird_deadline TIMESTAMP WITH TIME ZONE,

  -- Registration
  registration_opens TIMESTAMP WITH TIME ZONE DEFAULT now(),
  registration_closes TIMESTAMP WITH TIME ZONE,
  registration_deadline TIMESTAMP WITH TIME ZONE, -- Alias for mobile app
  waitlist_enabled BOOLEAN DEFAULT true,

  -- Requirements and details
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'all_levels', 'All Levels', 'Beginner', 'Intermediate', 'Advanced', 'Expert')),
  age_group TEXT CHECK (age_group IN ('kids', 'teens', 'adults', 'seniors', 'all_ages')),
  equipment_provided BOOLEAN DEFAULT false,
  equipment_provided_list TEXT[], -- Detailed list for mobile app
  equipment_required TEXT, -- What participants need to bring
  requirements TEXT[], -- Array format for mobile app

  -- Access control
  access_type TEXT DEFAULT 'reserve' CHECK (access_type IN ('reserve', 'open')), -- reserve = mobile app booking, open = walk-in

  -- Event materials and metadata
  image_url TEXT,
  additional_images TEXT[],
  tags TEXT[], -- For mobile app categorization
  location TEXT, -- Alternative location text

  -- Points and rewards (mobile app)
  points_reward INTEGER DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'draft', 'published', 'full')),
  cancellation_reason TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT events_dates_valid CHECK (end_date >= start_date),
  CONSTRAINT events_times_valid CHECK (end_time > start_time),
  CONSTRAINT events_capacity_positive CHECK (capacity > 0),
  CONSTRAINT events_registrations_valid CHECK (current_registrations >= 0 AND current_registrations <= capacity),
  CONSTRAINT events_price_positive CHECK (price >= 0),
  CONSTRAINT events_early_bird_valid CHECK (early_bird_price IS NULL OR early_bird_price >= 0)
);

-- Event registrations junction table
-- Tracks user registrations for partner-hosted events
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Registration details
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'waitlisted', 'cancelled', 'no_show', 'completed')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'partial_refund')),

  -- Pricing
  amount_paid DECIMAL(10, 2),
  discount_applied DECIMAL(10, 2) DEFAULT 0,

  -- Additional info
  emergency_contact TEXT,
  dietary_restrictions TEXT,
  special_requests TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  UNIQUE(event_id, user_id),
  CONSTRAINT registrations_amount_positive CHECK (amount_paid >= 0),
  CONSTRAINT registrations_discount_positive CHECK (discount_applied >= 0)
);

-- Event participants (mobile app focus)
-- Tracks participation, attendance, and feedback
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('registered', 'waitlist', 'attended', 'no_show', 'cancelled')) DEFAULT 'registered',
    points_earned INTEGER DEFAULT 0,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sport_formats_sport ON sport_formats(sport);
CREATE INDEX IF NOT EXISTS idx_sport_formats_is_active ON sport_formats(is_active);
CREATE INDEX IF NOT EXISTS idx_sport_formats_is_preferred ON sport_formats(is_preferred);

CREATE INDEX IF NOT EXISTS idx_events_partner_id ON events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_venue_id ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_court_id ON events(court_id);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_sport_id ON events(sport_id);
CREATE INDEX IF NOT EXISTS idx_events_sport_format_id ON events(sport_format_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type_id ON events(event_type_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_start_timestamp ON events(start_timestamp);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

CREATE INDEX IF NOT EXISTS idx_event_types_is_active ON event_types(is_active);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_sport_formats_updated_at
  BEFORE UPDATE ON sport_formats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at
  BEFORE UPDATE ON event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_participants_updated_at
  BEFORE UPDATE ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE sport_formats IS 'Official sport formats and participation configurations (singles, doubles, team sizes)';
COMMENT ON TABLE events IS 'Combined events and classes table supporting both partner portal and mobile app functionality';
COMMENT ON TABLE event_types IS 'Event type lookup table for mobile app categorization and points multipliers';
COMMENT ON TABLE event_registrations IS 'Partner portal event registrations with payment and detailed registration info';
COMMENT ON TABLE event_participants IS 'Mobile app event participation tracking with attendance and feedback';

-- Enable Row Level Security (RLS)
ALTER TABLE sport_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sport_formats table
-- Anon key can view all sport formats
CREATE POLICY "Allow anonymous read access to sport_formats"
  ON sport_formats
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated users can view all sport formats
CREATE POLICY "Allow authenticated read access to sport_formats"
  ON sport_formats
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for events table
-- Anon key can view all events
CREATE POLICY "Allow anonymous read access to events"
  ON events
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated partners can insert their own events
-- Validates both partner_id and venue_id ownership
CREATE POLICY "Allow authenticated partners to insert events"
  ON events
  FOR INSERT
  TO public
  WITH CHECK (
    (auth.role() = 'authenticated'::text) AND
    (EXISTS (
      SELECT 1
      FROM partners p
      WHERE p.user_id = auth.uid()
        AND p.id = partner_id
    )) AND
    (EXISTS (
      SELECT 1
      FROM venues v
      WHERE v.id = venue_id
        AND v.partner_id IN (
          SELECT id FROM partners WHERE user_id = auth.uid()
        )
    ))
  );

-- Authenticated partners can update their own events
-- Validates partner_id and venue_id ownership
CREATE POLICY "Allow authenticated partners to update their events"
  ON events
  FOR UPDATE
  TO public
  USING (
    (auth.role() = 'authenticated'::text) AND
    (EXISTS (
      SELECT 1
      FROM partners p
      WHERE p.user_id = auth.uid()
        AND p.id = events.partner_id
    )) AND
    (EXISTS (
      SELECT 1
      FROM venues v
      WHERE v.id = events.venue_id
        AND v.partner_id IN (
          SELECT id FROM partners WHERE user_id = auth.uid()
        )
    ))
  )
  WITH CHECK (
    (auth.role() = 'authenticated'::text) AND
    (EXISTS (
      SELECT 1
      FROM partners p
      WHERE p.user_id = auth.uid()
        AND p.id = partner_id
    )) AND
    (EXISTS (
      SELECT 1
      FROM venues v
      WHERE v.id = venue_id
        AND v.partner_id IN (
          SELECT id FROM partners WHERE user_id = auth.uid()
        )
    ))
  );

-- Authenticated partners can delete their own events
-- Validates partner_id and venue_id ownership
CREATE POLICY "Allow authenticated partners to delete their events"
  ON events
  FOR DELETE
  TO public
  USING (
    (auth.role() = 'authenticated'::text) AND
    (EXISTS (
      SELECT 1
      FROM partners p
      WHERE p.user_id = auth.uid()
        AND p.id = events.partner_id
    )) AND
    (EXISTS (
      SELECT 1
      FROM venues v
      WHERE v.id = events.venue_id
        AND v.partner_id IN (
          SELECT id FROM partners WHERE user_id = auth.uid()
        )
    ))
  );

-- RLS Policies for event_types table
-- Anon key can view all event types
CREATE POLICY "Allow anonymous read access to event_types"
  ON event_types
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can view event types
CREATE POLICY "Allow authenticated read access to event_types"
  ON event_types
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for event_registrations table
-- Anon key can view registrations (for public event capacity display)
CREATE POLICY "Allow anonymous read access to event_registrations"
  ON event_registrations
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can view their own registrations
CREATE POLICY "Allow authenticated users to view their registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own registrations
CREATE POLICY "Allow authenticated users to insert registrations"
  ON event_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own registrations
CREATE POLICY "Allow authenticated users to update their registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated partners can update registrations for their events
CREATE POLICY "Allow authenticated partners to update event registrations"
  ON event_registrations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT p.user_id
      FROM partners p
      JOIN events e ON e.partner_id = p.id
      WHERE e.id = event_id
    )
  );

-- Authenticated users can delete their own registrations
CREATE POLICY "Allow authenticated users to delete their registrations"
  ON event_registrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for event_participants table
-- Anon key can view participants (for public event display)
CREATE POLICY "Allow anonymous read access to event_participants"
  ON event_participants
  FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can view their own participation
CREATE POLICY "Allow authenticated users to view their participation"
  ON event_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own participation
CREATE POLICY "Allow authenticated users to insert participation"
  ON event_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own participation (for feedback)
CREATE POLICY "Allow authenticated users to update their participation"
  ON event_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated partners can update participants for their events
CREATE POLICY "Allow authenticated partners to update event participants"
  ON event_participants
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT p.user_id
      FROM partners p
      JOIN events e ON e.partner_id = p.id
      WHERE e.id = event_id
    )
  );

-- Authenticated users can delete their own participation
CREATE POLICY "Allow authenticated users to delete their participation"
  ON event_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Official Sport Formats
-- ============================================================================

-- Tennis formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('tennis', 'Singles', 'singles', 2, 1, true, 1, 'One player per side'),
  ('tennis', 'Doubles', 'doubles', 4, 2, true, 2, 'Two players per side')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Padel formats (same as tennis: singles and doubles)
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('padel', 'Singles', 'singles', 2, 1, true, 1, 'One player per side'),
  ('padel', 'Doubles', 'doubles', 4, 2, true, 2, 'Two players per side (most common format)')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Pickleball formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('pickleball', '2v2', 'doubles', 4, 2, true, 1, 'Two players per side (preferred format)')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Badminton formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('badminton', 'Singles', 'singles', 2, 1, true, 1, 'One player per side'),
  ('badminton', 'Doubles', 'doubles', 4, 2, true, 2, 'Two players per side')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Squash formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('squash', '1v1', 'singles', 2, 1, true, 1, 'One player per side (official format)')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Basketball formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('basketball', '5v5', 'team', 10, 5, true, 1, 'Five players per side (standard format)'),
  ('basketball', '3v3', 'team', 6, 3, false, 2, 'Three players per side (streetball format)')
ON CONFLICT (sport, format_name) DO NOTHING;

-- Volleyball formats
INSERT INTO sport_formats (sport, format_name, format_type, participant_count, team_size, is_preferred, display_order, description)
VALUES
  ('volleyball', 'Indoor 6v6', 'team', 12, 6, true, 1, 'Six players per side (indoor court)'),
  ('volleyball', 'Beach 2v2', 'team', 4, 2, false, 2, 'Two players per side (beach volleyball)')
ON CONFLICT (sport, format_name) DO NOTHING;
