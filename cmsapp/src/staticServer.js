import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = new Logger('StaticServer');

/**
 * Setup static file serving for public assets
 * @param {Express.Application} app - Express app instance
 */
export function setupStaticFiles(app) {
  const publicPath = path.join(__dirname, '../public');
  
  // Serve static files with caching headers
  app.use(express.static(publicPath, {
    maxAge: '1h',
    etag: true,
    lastModified: true
  }));

  // Serve main HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  // Serve admin page
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  logger.info('Static files configured');
}

/**
 * Configure CORS for development
 */
export function configureCORS(app) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });
}

/**
 * Setup error handling middleware
 */
export function setupErrorHandling(app, logger) {
  // 404 handler
  app.use((req, res) => {
    logger.warn(`404 - ${req.method} ${req.path}`);
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { 
      path: req.path,
      method: req.method,
      stack: err.stack 
    });

    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error'
        : err.message
    });
  });
}

export default { setupStaticFiles, configureCORS, setupErrorHandling };
