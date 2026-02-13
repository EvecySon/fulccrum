-- ================================================================
-- CREATE ADMIN USER FOR FULCCRUM PLATFORM
-- ================================================================
-- Run this SQL in your PostgreSQL database to create an admin user
-- 
-- Credentials:
-- Email: admin@fulccrum.com
-- Password: Admin123!
-- Phone: +2348012345678
-- ================================================================

-- Step 1: Clean up any existing admin user
DELETE FROM "AdminUser" WHERE user_id IN (SELECT id FROM "User" WHERE email = 'admin@fulccrum.com');
DELETE FROM "User" WHERE email = 'admin@fulccrum.com';

-- Step 2: Create the admin user
-- Password hash is bcrypt hash of "Admin123!" with salt rounds = 10
INSERT INTO "User" (
  id,
  email,
  phone,
  password_hash,
  first_name,
  last_name,
  role,
  email_verified,
  phone_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@fulccrum.com',
  '+2348012345678',
  '$2b$10$8t32eo7A1XHh9j3b1geWPelNeXuXHMTork8ooTLROEOxurj78319S',
  'Admin',
  'User',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);

-- Step 3: Create the AdminUser profile
INSERT INTO "AdminUser" (
  id,
  user_id,
  department,
  permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'admin@fulccrum.com'),
  'Operations',
  ARRAY['all'],
  NOW(),
  NOW()
);

-- Step 4: Verify the user was created
SELECT 
  u.id,
  u.email,
  u.phone,
  u.role,
  u.first_name,
  u.last_name,
  u.email_verified,
  u.phone_verified,
  a.id as admin_id,
  a.department,
  a.permissions
FROM "User" u
LEFT JOIN "AdminUser" a ON a.user_id = u.id
WHERE u.email = 'admin@fulccrum.com';

-- ================================================================
-- DONE! You can now login with:
-- Email: admin@fulccrum.com
-- Password: Admin123!
-- ================================================================
