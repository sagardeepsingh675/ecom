-- =============================================
-- COUPONS TABLE MIGRATION
-- =============================================

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount Type
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  
  -- Limits
  max_uses INTEGER, -- NULL means unlimited
  current_uses INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2), -- For percentage discounts
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Applicability
  applies_to VARCHAR(20) DEFAULT 'all' CHECK (applies_to IN ('all', 'webinar', 'service')),
  applicable_items UUID[], -- Specific webinar or service IDs, NULL means all
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- What was it used for
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('webinar', 'service')),
  item_id UUID NOT NULL,
  
  -- Discount applied
  original_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  
  -- Timestamps
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user ON coupon_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON coupon_usages(coupon_id);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- Everyone can validate coupons
CREATE POLICY "Everyone can validate coupons" 
  ON coupons FOR SELECT 
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Admins can manage coupons
CREATE POLICY "Admins can manage coupons" 
  ON coupons FOR ALL 
  USING (is_admin());

-- Users can see their own coupon usage
CREATE POLICY "Users can see own coupon usage" 
  ON coupon_usages FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

-- Users can create coupon usage (when applying coupon)
CREATE POLICY "Users can create coupon usage" 
  ON coupon_usages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update coupon uses
CREATE OR REPLACE FUNCTION increment_coupon_uses()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons 
  SET current_uses = current_uses + 1 
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_coupon_used
  AFTER INSERT ON coupon_usages
  FOR EACH ROW
  EXECUTE FUNCTION increment_coupon_uses();

-- Trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
