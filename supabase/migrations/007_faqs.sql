-- FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for active FAQs
CREATE POLICY "Anyone can view active FAQs" ON faqs
    FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admins can manage FAQs" ON faqs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Seed some sample FAQs
INSERT INTO faqs (question, answer, category, display_order) VALUES
('What is a webinar?', 'A webinar is a live, interactive online seminar where you can learn from industry experts in real-time. You can ask questions, participate in discussions, and get immediate feedback.', 'General', 1),
('How do I register for a webinar?', 'Simply browse our available webinars, click on the one you''re interested in, and click the "Register" button. You''ll need to create an account or sign in to complete your registration.', 'Registration', 2),
('Can I get a refund if I can''t attend?', 'Yes, we offer refunds up to 24 hours before the webinar starts. After that, you can request access to the recording instead. Contact our support team for assistance.', 'Payments', 3),
('Will I receive a certificate after completing a webinar?', 'Yes! Upon successful completion of any paid webinar, you will receive a certificate that you can download from your dashboard and share on LinkedIn or other platforms.', 'Certificates', 4),
('How do I join the live session?', 'Once registered, you''ll receive the meeting link via email before the session. You can also find the link in your dashboard under "My Webinars". Just click the link at the scheduled time to join.', 'Attendance', 5),
('What if I face technical issues during the webinar?', 'Ensure you have a stable internet connection and use a modern browser (Chrome, Firefox, Safari). If issues persist, contact our support immediately via the chat button on our website.', 'Technical', 6),
('Are webinar recordings available?', 'Yes, recordings are available for paid webinars. They''ll be added to your dashboard within 24-48 hours after the live session ends.', 'Recording', 7),
('How can I contact support?', 'You can reach us through the Contact form on our website, or email us directly. We typically respond within 24 hours on business days.', 'Support', 8);
