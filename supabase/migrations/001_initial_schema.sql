-- =============================================
-- Webinar Booking Platform - Initial Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. SITE SETTINGS TABLE
-- Stores website configuration (single row)
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) DEFAULT 'Webinar Platform',
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  
  -- Contact Information
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  
  -- Social Links
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  
  -- Cashfree Payment Gateway
  cashfree_app_id TEXT,
  cashfree_secret_key TEXT,
  cashfree_environment VARCHAR(20) DEFAULT 'sandbox', -- 'sandbox' or 'production'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. USERS TABLE
-- Extended user profiles with roles
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. WEBINARS TABLE
-- Webinar listings
-- =============================================
CREATE TABLE IF NOT EXISTS webinars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Pricing & Slots
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2), -- For showing discounts
  total_slots INTEGER NOT NULL DEFAULT 100,
  available_slots INTEGER NOT NULL DEFAULT 100,
  
  -- Schedule
  webinar_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  
  -- Host Information
  host_name VARCHAR(255),
  host_title VARCHAR(255),
  host_image_url TEXT,
  host_bio TEXT,
  
  -- Media
  thumbnail_url TEXT,
  banner_url TEXT,
  
  -- Meeting Details (added after payment)
  meeting_link TEXT,
  meeting_password VARCHAR(100),
  meeting_platform VARCHAR(50) DEFAULT 'zoom', -- 'zoom' or 'google_meet'
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. WEBINAR REGISTRATIONS TABLE
-- User bookings for webinars
-- =============================================
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  webinar_id UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  
  -- Invoice
  invoice_number VARCHAR(50) UNIQUE,
  invoice_url TEXT,
  
  -- Meeting Link Access
  meeting_link_sent BOOLEAN DEFAULT FALSE,
  meeting_link_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate registrations
  UNIQUE(user_id, webinar_id)
);

-- =============================================
-- 5. SERVICES TABLE
-- Additional service packages (sales boost, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  
  -- Features (stored as JSON array)
  features JSONB DEFAULT '[]'::jsonb,
  
  -- Media
  icon_url TEXT,
  image_url TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. SERVICE PURCHASES TABLE
-- User purchases of services
-- =============================================
CREATE TABLE IF NOT EXISTS service_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Payment Details
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  
  -- Invoice
  invoice_number VARCHAR(50) UNIQUE,
  invoice_url TEXT,
  
  -- Service Fulfillment
  fulfillment_status VARCHAR(20) DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'in_progress', 'completed')),
  fulfillment_notes TEXT,
  
  -- Timestamps
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. CONTACT LEADS TABLE
-- Contact form submissions
-- =============================================
CREATE TABLE IF NOT EXISTS contact_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES users(id),
  
  -- Notes for admin
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Webinars
CREATE INDEX IF NOT EXISTS idx_webinars_slug ON webinars(slug);
CREATE INDEX IF NOT EXISTS idx_webinars_status ON webinars(status);
CREATE INDEX IF NOT EXISTS idx_webinars_date ON webinars(webinar_date);
CREATE INDEX IF NOT EXISTS idx_webinars_featured ON webinars(is_featured) WHERE is_featured = TRUE;

-- Webinar Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_user ON webinar_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_webinar ON webinar_registrations(webinar_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON webinar_registrations(payment_status);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = TRUE;

-- Service Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_user ON service_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_service ON service_purchases(service_id);

-- Contact Leads
CREATE INDEX IF NOT EXISTS idx_contact_unread ON contact_leads(is_read) WHERE is_read = FALSE;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_leads ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SITE SETTINGS POLICIES
-- =============================================

-- Anyone can read site settings
CREATE POLICY "Site settings are viewable by everyone" 
  ON site_settings FOR SELECT 
  USING (true);

-- Only admins can modify site settings
CREATE POLICY "Only admins can update site settings" 
  ON site_settings FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can insert site settings" 
  ON site_settings FOR INSERT 
  WITH CHECK (is_admin());

-- =============================================
-- USERS POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =============================================
-- WEBINARS POLICIES
-- =============================================

-- Everyone can view published webinars
CREATE POLICY "Published webinars are viewable by everyone" 
  ON webinars FOR SELECT 
  USING (status = 'published' OR is_admin());

-- Only admins can modify webinars
CREATE POLICY "Only admins can insert webinars" 
  ON webinars FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update webinars" 
  ON webinars FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete webinars" 
  ON webinars FOR DELETE 
  USING (is_admin());

-- =============================================
-- WEBINAR REGISTRATIONS POLICIES
-- =============================================

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations" 
  ON webinar_registrations FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

-- Users can create their own registrations
CREATE POLICY "Users can create own registrations" 
  ON webinar_registrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update registrations (for payment status, meeting links)
CREATE POLICY "Only admins can update registrations" 
  ON webinar_registrations FOR UPDATE 
  USING (is_admin());

-- =============================================
-- SERVICES POLICIES
-- =============================================

-- Everyone can view active services
CREATE POLICY "Active services are viewable by everyone" 
  ON services FOR SELECT 
  USING (is_active = TRUE OR is_admin());

-- Only admins can modify services
CREATE POLICY "Only admins can insert services" 
  ON services FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update services" 
  ON services FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete services" 
  ON services FOR DELETE 
  USING (is_admin());

-- =============================================
-- SERVICE PURCHASES POLICIES
-- =============================================

-- Users can view their own purchases
CREATE POLICY "Users can view own service purchases" 
  ON service_purchases FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

-- Users can create their own purchases
CREATE POLICY "Users can create own service purchases" 
  ON service_purchases FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update purchases
CREATE POLICY "Only admins can update service purchases" 
  ON service_purchases FOR UPDATE 
  USING (is_admin());

-- =============================================
-- CONTACT LEADS POLICIES
-- =============================================

-- Anyone can create contact leads (no auth required)
CREATE POLICY "Anyone can create contact leads" 
  ON contact_leads FOR INSERT 
  WITH CHECK (true);

-- Only admins can view and manage contact leads
CREATE POLICY "Only admins can view contact leads" 
  ON contact_leads FOR SELECT 
  USING (is_admin());

CREATE POLICY "Only admins can update contact leads" 
  ON contact_leads FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Only admins can delete contact leads" 
  ON contact_leads FOR DELETE 
  USING (is_admin());

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webinar_registrations_updated_at
  BEFORE UPDATE ON webinar_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_purchases_updated_at
  BEFORE UPDATE ON service_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- DECREMENT WEBINAR SLOTS ON REGISTRATION
-- =============================================
CREATE OR REPLACE FUNCTION decrement_webinar_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE webinars 
    SET available_slots = available_slots - 1 
    WHERE id = NEW.webinar_id AND available_slots > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_registration_completed
  AFTER INSERT OR UPDATE ON webinar_registrations
  FOR EACH ROW
  EXECUTE FUNCTION decrement_webinar_slots();

-- =============================================
-- INSERT DEFAULT SITE SETTINGS
-- =============================================
INSERT INTO site_settings (site_name, site_description, email)
VALUES ('Webinar Platform', 'Learn from the best with our exclusive webinars', 'contact@example.com')
ON CONFLICT DO NOTHING;
