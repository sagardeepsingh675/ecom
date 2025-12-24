-- =============================================
-- Webinar Booking Platform - Seed Data
-- Run this AFTER the initial schema migration
-- =============================================

-- =============================================
-- SAMPLE WEBINARS
-- =============================================
INSERT INTO webinars (
  title, 
  slug, 
  description, 
  short_description,
  price, 
  original_price,
  total_slots, 
  available_slots,
  webinar_date, 
  start_time, 
  end_time,
  host_name, 
  host_title, 
  host_bio,
  status, 
  is_featured
) VALUES 
(
  'Master Digital Marketing in 2024',
  'master-digital-marketing-2024',
  'Join us for an intensive 3-hour webinar where you will learn the latest digital marketing strategies that are working right now. We will cover SEO, social media marketing, email campaigns, and paid advertising. Perfect for beginners and intermediate marketers looking to level up their skills.',
  'Learn cutting-edge digital marketing strategies from industry experts.',
  1999.00,
  4999.00,
  100,
  87,
  CURRENT_DATE + INTERVAL '7 days',
  '14:00:00',
  '17:00:00',
  'Rahul Sharma',
  'Digital Marketing Expert | 10+ Years Experience',
  'Rahul has helped over 500 businesses grow their online presence. Former marketing head at major tech companies.',
  'published',
  true
),
(
  'Build Your First AI Application',
  'build-first-ai-application',
  'Discover how to leverage AI in your projects without being a data scientist. This hands-on webinar will walk you through building practical AI applications using modern tools and APIs. You will create your first AI-powered app by the end of this session.',
  'No-code AI application development for beginners.',
  2499.00,
  5999.00,
  75,
  62,
  CURRENT_DATE + INTERVAL '14 days',
  '10:00:00',
  '13:00:00',
  'Priya Patel',
  'AI Engineer & Educator',
  'Priya is an AI specialist who has trained over 10,000 students worldwide. She simplifies complex AI concepts for everyone.',
  'published',
  true
),
(
  'Financial Freedom Blueprint',
  'financial-freedom-blueprint',
  'Learn the proven strategies for building wealth and achieving financial independence. This webinar covers investment basics, passive income streams, tax optimization, and long-term wealth building. Start your journey to financial freedom today.',
  'Your complete guide to building lasting wealth.',
  1499.00,
  3999.00,
  150,
  134,
  CURRENT_DATE + INTERVAL '21 days',
  '18:00:00',
  '20:00:00',
  'Amit Verma',
  'Certified Financial Planner',
  'Amit has helped thousands achieve their financial goals with practical, actionable advice.',
  'published',
  false
);

-- =============================================
-- SAMPLE SERVICES
-- =============================================
INSERT INTO services (
  name,
  slug,
  description,
  short_description,
  price,
  original_price,
  features,
  is_active,
  is_featured,
  display_order
) VALUES
(
  'Sales Boost Package - Starter',
  'sales-boost-starter',
  'Perfect for small businesses looking to increase their sales. Get personalized consultation and proven strategies to boost your revenue.',
  'Kickstart your sales growth journey',
  9999.00,
  14999.00,
  '["2 Hour Strategy Session", "Sales Funnel Review", "3 Month Action Plan", "Email Templates", "Follow-up Support"]'::jsonb,
  true,
  true,
  1
),
(
  'Sales Boost Package - Pro',
  'sales-boost-pro',
  'Comprehensive sales transformation for growing businesses. Includes hands-on implementation support and advanced marketing strategies.',
  'Complete sales transformation package',
  24999.00,
  39999.00,
  '["5 Hour Strategy Sessions", "Complete Sales Funnel Build", "6 Month Action Plan", "Custom Email Sequences", "Landing Page Design", "Priority Support", "Monthly Review Calls"]'::jsonb,
  true,
  true,
  2
),
(
  'Sales Boost Package - Enterprise',
  'sales-boost-enterprise',
  'Full-service sales and marketing solution for established businesses. Our team works alongside yours to drive massive growth.',
  'Done-for-you sales system',
  49999.00,
  79999.00,
  '["10 Hour Strategy Sessions", "Complete Marketing Overhaul", "12 Month Partnership", "Dedicated Account Manager", "All Marketing Assets", "Weekly Strategy Calls", "Performance Dashboard", "Unlimited Revisions"]'::jsonb,
  true,
  false,
  3
),
(
  '1-on-1 Mentorship',
  'one-on-one-mentorship',
  'Get personalized guidance from our expert mentors. Perfect for entrepreneurs and professionals looking for tailored advice.',
  'Personal mentorship for accelerated growth',
  4999.00,
  7999.00,
  '["1 Hour Private Session", "Personalized Advice", "Action Items", "Recording Provided", "Email Follow-up"]'::jsonb,
  true,
  false,
  4
);

-- =============================================
-- SAMPLE CONTACT LEADS (for testing admin panel)
-- =============================================
INSERT INTO contact_leads (
  name,
  email,
  phone,
  subject,
  message,
  is_read,
  created_at
) VALUES
(
  'Neha Gupta',
  'neha.gupta@email.com',
  '+91 98765 43210',
  'Question about Digital Marketing Webinar',
  'Hi, I am interested in the digital marketing webinar. Can you tell me if there will be any certification provided? Also, will the recording be available after the session?',
  false,
  NOW() - INTERVAL '2 hours'
),
(
  'Vikram Singh',
  'vikram.s@company.com',
  '+91 87654 32109',
  'Bulk Registration Query',
  'Our company wants to register 15 employees for the AI webinar. Do you offer any corporate discounts? Please share the details.',
  false,
  NOW() - INTERVAL '1 day'
),
(
  'Ananya Reddy',
  'ananya.r@startup.io',
  NULL,
  'Partnership Opportunity',
  'We are a ed-tech startup and would love to explore partnership opportunities. Can we schedule a call to discuss?',
  true,
  NOW() - INTERVAL '3 days'
);

-- =============================================
-- UPDATE SITE SETTINGS with sample data
-- =============================================
UPDATE site_settings SET
  site_name = 'WebinarPro',
  site_description = 'Learn from industry experts through our exclusive live webinars. Transform your career with practical knowledge.',
  email = 'hello@webinarpro.com',
  phone = '+91 98765 43210',
  address = 'Bangalore, Karnataka, India',
  facebook_url = 'https://facebook.com/webinarpro',
  twitter_url = 'https://twitter.com/webinarpro',
  instagram_url = 'https://instagram.com/webinarpro',
  linkedin_url = 'https://linkedin.com/company/webinarpro',
  youtube_url = 'https://youtube.com/@webinarpro'
WHERE id = (SELECT id FROM site_settings LIMIT 1);
