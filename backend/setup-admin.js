// Setup Admin User - Direct Database Script
// This bypasses Prisma client initialization issues

const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function setupAdmin() {
  // Database connection from environment or default
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cascade_dev';
  
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const email = 'admin@fulccrum.com';
    const phone = '+2348012345678';
    const password = 'Admin123!';
    const firstName = 'Admin';
    const lastName = 'User';

    // Generate bcrypt hash
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    console.log('🔍 Checking for existing user...');
    const checkUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (checkUser.rows.length > 0) {
      console.log('⚠️  User already exists. Deleting and recreating...');
      const userId = checkUser.rows[0].id;
      
      // Delete existing records
      await client.query('DELETE FROM admin_users WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log('✅ Existing user deleted');
    }

    // Create user
    console.log('📝 Creating admin user...');
    const userResult = await client.query(
      `INSERT INTO users (
        id, email, phone, password_hash, first_name, last_name, 
        role, email_verified, phone_verified, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 
        'admin', true, true, NOW(), NOW()
      ) RETURNING id`,
      [email, phone, hashedPassword, firstName, lastName]
    );

    const userId = userResult.rows[0].id;
    console.log('✅ User created with ID:', userId);

    // Create or get super admin role
    console.log('👑 Creating/getting super admin role...');
    let roleResult = await client.query(
      `SELECT id FROM admin_roles WHERE name = 'super_admin'`
    );
    
    let roleId;
    if (roleResult.rows.length === 0) {
      // Create super admin role
      roleResult = await client.query(
        `INSERT INTO admin_roles (
          id, name, display_name, description, permissions, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), 'super_admin', 'Super Admin', 'Full system access', 
          '["all"]'::jsonb, NOW(), NOW()
        ) RETURNING id`
      );
      roleId = roleResult.rows[0].id;
      console.log('✅ Super admin role created');
    } else {
      roleId = roleResult.rows[0].id;
      console.log('✅ Using existing super admin role');
    }

    // Create admin user
    console.log('👑 Creating AdminUser record...');
    await client.query(
      `INSERT INTO admin_users (
        id, user_id, role_id, department, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, 'Operations', NOW(), NOW()
      )`,
      [userId, roleId]
    );

    console.log('✅ AdminUser record created');

    // Verify
    const verify = await client.query(
      `SELECT 
        u.id, u.email, u.phone, u.role, u.first_name, u.last_name,
        a.id as admin_id, a.department
      FROM users u
      LEFT JOIN admin_users a ON a.user_id = u.id
      WHERE u.email = $1`,
      [email]
    );

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('📱 Phone:', phone);
    console.log('🔑 Password:', password);
    console.log('═══════════════════════════════════════');
    console.log('\nUser Details:');
    console.log(verify.rows[0]);
    console.log('\n✨ You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

setupAdmin();
