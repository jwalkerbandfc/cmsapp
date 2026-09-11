import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Logger from './logger.js';

class AuthManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.logger = new Logger('Auth');
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  generateToken(email, expiresIn = '24h') {
    return jwt.sign(
      { email, iat: Date.now() },
      this.jwtSecret,
      { expiresIn }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      this.logger.error('Token verification failed', { error: error.message });
      throw new Error('Invalid token');
    }
  }

  async register(email, password) {
    try {
      // Check if user exists
      const existingUser = await this.supabase.getAdminUser(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const passwordHash = await this.hashPassword(password);
      const user = await this.supabase.createAdminUser(email, passwordHash);
      
      this.logger.info(`User registered: ${email}`);
      return {
        user: { id: user.id, email: user.email },
        token: this.generateToken(email)
      };
    } catch (error) {
      this.logger.error('Registration failed', { error: error.message });
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await this.supabase.getAdminUser(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await this.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        throw new Error('Account is inactive');
      }

      this.logger.info(`User logged in: ${email}`);
      return {
        user: { id: user.id, email: user.email },
        token: this.generateToken(email)
      };
    } catch (error) {
      this.logger.error('Login failed', { error: error.message });
      throw error;
    }
  }
}

// Middleware for Express
export function createAuthMiddleware(authManager) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = authManager.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Unauthorized' });
    }
  };
}

export default AuthManager;
