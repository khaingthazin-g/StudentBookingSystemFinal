/**
 * Run once to create a default admin user.
 * Usage:  npx tsx scripts/create-admin.ts
 *
 * Default credentials:
 *   Email:    admin@tutorbook.com
 *   Password: Admin@123
 *
 * Change ADMIN_EMAIL / ADMIN_PASSWORD below before running if needed.
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@tutorbook.com';
const ADMIN_PASSWORD = 'Admin@123';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '11111111',
  database: process.env.DB_NAME     || 'tutor_booking',
});

async function main() {
  console.log('🔌 Connecting to database…');

  // Check if admin already exists
  const [rows]: any = await pool.execute(
    'SELECT id, email FROM Users WHERE email = ?',
    [ADMIN_EMAIL]
  );

  if (rows.length > 0) {
    console.log(`⚠️  Admin already exists (id=${rows[0].id}, email=${rows[0].email}). Skipping.`);
    await pool.end();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await pool.execute(
    'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [ADMIN_NAME, ADMIN_EMAIL, hashed, 'admin']
  );

  console.log('✅ Admin user created successfully!');
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n⚠️  Change the password after first login.');

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
