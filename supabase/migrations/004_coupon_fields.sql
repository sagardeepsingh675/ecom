-- =============================================
-- ADD COUPON FIELDS TO REGISTRATION/PURCHASE TABLES
-- This migration adds coupon tracking to webinar_registrations and service_purchases
-- =============================================

-- Add coupon fields to webinar_registrations
ALTER TABLE webinar_registrations 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

-- Add coupon fields to service_purchases
ALTER TABLE service_purchases 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_coupon ON webinar_registrations(coupon_id);
CREATE INDEX IF NOT EXISTS idx_service_purchases_coupon ON service_purchases(coupon_id);
CREATE INDEX IF NOT EXISTS idx_webinar_registrations_transaction ON webinar_registrations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_service_purchases_transaction ON service_purchases(transaction_id);
