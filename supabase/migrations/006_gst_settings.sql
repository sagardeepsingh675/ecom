-- =============================================
-- GST SETTINGS MIGRATION
-- Adds tax/GST configuration to site_settings
-- =============================================

-- Add GST fields to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS gst_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gst_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5, 2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Note: Services/Webinars are priced as inclusive of GST
-- When GST is enabled, invoice will show tax breakdown
-- Tax amount = (Total Amount * GST Rate) / (100 + GST Rate)
