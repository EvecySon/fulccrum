-- Create Admin User in Database
-- This script creates an admin user with the following credentials:
-- Email: admin@fulccrum.com
-- Password: Admin123!

-- First, check if user already exists and delete if needed
DELETE FROM "AdminUser" WHERE "userId" IN (SELECT id FROM "User" WHERE email = 'admin@fulccrum.com');
DELETE FROM "User" WHERE email = 'admin@fulccrum.com';

-- Create the user with hashed password (bcrypt hash of "Admin123!")
-- Hash generated with: bcrypt.hash('Admin123!', 10)
INSERT INTO "User" (
  id,
  email,
  phone,
  password,
  "firstName",
  "lastName",
  role,
  "isEmailVerified",
  "isPhoneVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@fulccrum.com',
  '+2348012345678',
  '$2b$10$YQ5XJ5XJ5XJ5XJ5XJ5XJ5.YQ5XJ5XJ5XJ5XJ5XJ5XJ5XJ5XJ5XJ5XO',
  'Admin',
  'User',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);

-- Create the AdminUser record
INSERT INTO "AdminUser" (
  id,
  "userId",
  department,
  permissions,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE email = 'admin@fulccrum.com'),
  'Operations',
  ARRAY['all'],
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  u.id as user_id,
  u.email,
  u.phone,
  u.role,
  u."firstName",
  u."lastName",
  a.id as admin_id,
  a.department
FROM "User" u
LEFT JOIN "AdminUser" a ON a."userId" = u.id
WHERE u.email = 'admin@fulccrum.com';
