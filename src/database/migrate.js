const { initializeDatabase, dbWrapper, saveDatabase } = require('./connection');

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  await initializeDatabase();
  const db = dbWrapper;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'moderator')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended', 'pending')),
      profile_photo TEXT,
      phone TEXT,
      bio TEXT,
      is_verified INTEGER DEFAULT 0,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Users table created');

  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Refresh tokens table created');

  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Verification tokens table created');

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✅ Password reset tokens table created');

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token)
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash)
  `);
  console.log('✅ Indexes created');

  saveDatabase();
  console.log('\n🎉 Migration completed successfully!');
}

if (require.main === module) {
  migrate().then(() => process.exit(0));
}

module.exports = migrate;
