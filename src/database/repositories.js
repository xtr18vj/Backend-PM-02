const { dbWrapper } = require('./connection');
const { v4: uuidv4 } = require('uuid');

class UserRepository {

  static create(email, passwordHash, name = null) {
    const id = uuidv4();
    const stmt = dbWrapper.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, email.toLowerCase(), passwordHash, name);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = dbWrapper.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByEmail(email) {
    const stmt = dbWrapper.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email.toLowerCase());
  }

  static findAll(options = {}) {
    const { limit = 50, offset = 0, status = null, role = null } = options;
    let query = 'SELECT id, email, name, role, status, profile_photo, phone, bio, is_verified, last_login, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const stmt = dbWrapper.prepare(query);
    return stmt.all(...params);
  }

  static verify(userId) {
    const stmt = dbWrapper.prepare(`
      UPDATE users SET is_verified = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(userId);
  }

  static updatePassword(userId, passwordHash) {
    const stmt = dbWrapper.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(passwordHash, userId);
  }

  static updateProfile(userId, fields) {
    const allowedFields = ['name', 'profile_photo', 'phone', 'bio'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updates.length === 0) return null;
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    const stmt = dbWrapper.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);
    return this.findById(userId);
  }

  static adminUpdate(userId, fields) {
    const allowedFields = ['name', 'email', 'role', 'status', 'profile_photo', 'phone', 'bio', 'is_verified'];
    const updates = [];
    const values = [];
    
    for (const [key, value] of Object.entries(fields)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(key === 'email' ? value.toLowerCase() : value);
      }
    }
    
    if (updates.length === 0) return null;
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(userId);
    
    const stmt = dbWrapper.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...values);
    return this.findById(userId);
  }

  static updateLastLogin(userId) {
    const stmt = dbWrapper.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(userId);
  }

  static delete(userId) {
    const stmt = dbWrapper.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(userId);
  }

  static getPublicProfile(userId) {
    const stmt = dbWrapper.prepare(`
      SELECT id, name, profile_photo, bio, created_at 
      FROM users WHERE id = ? AND status = 'active'
    `);
    return stmt.get(userId);
  }
}

class RefreshTokenRepository {

  static create(userId, tokenHash, expiresAt) {
    const id = uuidv4();
    const stmt = dbWrapper.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, userId, tokenHash, expiresAt);
    return id;
  }

  static findByTokenHash(tokenHash) {
    const stmt = dbWrapper.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE token_hash = ? AND revoked = 0
    `);
    return stmt.get(tokenHash);
  }

  static revoke(id) {
    const stmt = dbWrapper.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE id = ?
    `);
    return stmt.run(id);
  }

  static revokeAllForUser(userId) {
    const stmt = dbWrapper.prepare(`
      UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?
    `);
    return stmt.run(userId);
  }

  static deleteExpired() {
    const stmt = dbWrapper.prepare(`
      DELETE FROM refresh_tokens 
      WHERE expires_at < datetime('now') OR revoked = 1
    `);
    return stmt.run();
  }
}

class VerificationTokenRepository {

  static create(userId, token, expiresAt) {
    const id = uuidv4();
    const stmt = dbWrapper.prepare(`
      INSERT INTO verification_tokens (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, userId, token, expiresAt);
    return id;
  }

  static findByToken(token) {
    const stmt = dbWrapper.prepare(`
      SELECT * FROM verification_tokens 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `);
    return stmt.get(token);
  }

  static markUsed(id) {
    const stmt = dbWrapper.prepare(`
      UPDATE verification_tokens SET used = 1 WHERE id = ?
    `);
    return stmt.run(id);
  }

  static deleteExpired() {
    const stmt = dbWrapper.prepare(`
      DELETE FROM verification_tokens 
      WHERE expires_at < datetime('now') OR used = 1
    `);
    return stmt.run();
  }
}

class PasswordResetTokenRepository {

  static create(userId, tokenHash, expiresAt) {
    const id = uuidv4();
    const stmt = dbWrapper.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, userId, tokenHash, expiresAt);
    return id;
  }

  static findByTokenHash(tokenHash) {
    const stmt = dbWrapper.prepare(`
      SELECT * FROM password_reset_tokens 
      WHERE token_hash = ? AND used = 0 AND expires_at > datetime('now')
    `);
    return stmt.get(tokenHash);
  }

  static markUsed(id) {
    const stmt = dbWrapper.prepare(`
      UPDATE password_reset_tokens SET used = 1 WHERE id = ?
    `);
    return stmt.run(id);
  }

  static invalidateForUser(userId) {
    const stmt = dbWrapper.prepare(`
      UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?
    `);
    return stmt.run(userId);
  }
}

module.exports = {
  UserRepository,
  RefreshTokenRepository,
  VerificationTokenRepository,
  PasswordResetTokenRepository,
};
