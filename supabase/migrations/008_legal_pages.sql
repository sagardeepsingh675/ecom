-- Legal/Policy pages table
CREATE TABLE IF NOT EXISTS legal_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view legal pages" ON legal_pages
    FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admins can manage legal pages" ON legal_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Insert default pages
INSERT INTO legal_pages (slug, title, content) VALUES
('privacy-policy', 'Privacy Policy', '## Privacy Policy

**Last Updated: [Date]**

### 1. Information We Collect

We collect information you provide directly to us, such as when you create an account, register for a webinar, make a purchase, or contact us for support.

### 2. How We Use Your Information

We use the information we collect to:
- Process transactions and send related information
- Send you technical notices, updates, and administrative messages
- Respond to your comments, questions, and requests
- Communicate with you about products, services, and events

### 3. Information Sharing

We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

### 4. Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

### 5. Contact Us

If you have any questions about this Privacy Policy, please contact us.'),

('terms-of-service', 'Terms of Service', '## Terms of Service

**Last Updated: [Date]**

### 1. Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by the terms and provisions of this agreement.

### 2. Use of Service

You agree to use this service only for lawful purposes and in accordance with these Terms. You agree not to use the service in any way that violates any applicable laws or regulations.

### 3. User Accounts

When you create an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials.

### 4. Intellectual Property

All content on this website, including text, graphics, logos, and software, is the property of the company and is protected by copyright laws.

### 5. Limitation of Liability

In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the service.

### 6. Changes to Terms

We reserve the right to modify these terms at any time. Your continued use of the service after any changes indicates your acceptance of the new terms.

### 7. Contact Information

For any questions regarding these Terms of Service, please contact us.'),

('refund-policy', 'Refund Policy', '## Refund Policy

**Last Updated: [Date]**

### 1. Webinar Refunds

**Before the Event:**
- Full refund available up to 24 hours before the webinar starts
- 50% refund available between 24-12 hours before the webinar
- No refund within 12 hours of the webinar start time

**After the Event:**
- If you attended and are unsatisfied, contact us within 48 hours for case-by-case review
- Recording access may be provided as an alternative to refund

### 2. Service Package Refunds

- Refund requests must be made within 7 days of purchase
- Services already delivered are non-refundable
- Partial refunds may be issued for partially completed services

### 3. How to Request a Refund

To request a refund:
1. Email us with your order details
2. Include your reason for the refund request
3. Allow 3-5 business days for review
4. Approved refunds are processed within 7-10 business days

### 4. Non-Refundable Items

- Completed webinar recordings already accessed
- Certificates already issued
- Services already delivered

### 5. Contact Us

For refund requests or questions, please contact our support team.');
