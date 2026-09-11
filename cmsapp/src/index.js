import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import Logger from './logger.js';
import SupabaseClient from './supabaseClient.js';
import AuthManager, { createAuthMiddleware } from './auth.js';

dotenv.config();

const app = express();
const logger = new Logger('Server');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Initialize Supabase and Auth
let supabase, authManager, authMiddleware;

try {
  supabase = new SupabaseClient();
  authManager = new AuthManager(supabase);
  authMiddleware = createAuthMiddleware(authManager);
  logger.info('Services initialized successfully');
} catch (error) {
  logger.error('Failed to initialize services', { error: error.message });
  process.exit(1);
}

// ==================== PUBLIC ROUTES ====================

// Get all published pages
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await supabase.getAllPages();
    res.json(pages);
  } catch (error) {
    logger.error('Failed to fetch pages', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get single page by slug
app.get('/api/pages/:slug', async (req, res) => {
  try {
    const page = await supabase.getPage(req.params.slug, true);
    const assets = await supabase.getPageAssets(page.id);
    res.json({ ...page, assets });
  } catch (error) {
    res.status(404).json({ error: 'Page not found' });
  }
});

// Get navigation links
app.get('/api/navigation', async (req, res) => {
  try {
    const links = await supabase.getNavigationLinks();
    res.json(links);
  } catch (error) {
    logger.error('Failed to fetch navigation', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

// ==================== AUTHENTICATION ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await authManager.register(email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await authManager.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// ==================== PROTECTED ADMIN ROUTES ====================

// Create page
app.post('/api/admin/pages', authMiddleware, async (req, res) => {
  try {
    const { title, slug, heroTitle, heroSubtitle, heroImage } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug required' });
    }

    const page = await supabase.createPage({
      title,
      slug,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_image: heroImage,
      content: { blocks: [] }
    });

    res.status(201).json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update page
app.put('/api/admin/pages/:id', authMiddleware, async (req, res) => {
  try {
    const page = await supabase.updatePage(req.params.id, {
      ...req.body,
      updated_at: new Date()
    });
    res.json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Publish page
app.patch('/api/admin/pages/:id/publish', authMiddleware, async (req, res) => {
  try {
    const page = await supabase.updatePage(req.params.id, {
      is_published: true
    });
    res.json(page);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete page
app.delete('/api/admin/pages/:id', authMiddleware, async (req, res) => {
  try {
    await supabase.deletePage(req.params.id);
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create asset (drag-drop content)
app.post('/api/admin/pages/:pageId/assets', authMiddleware, async (req, res) => {
  try {
    const { type, content, position } = req.body;
    
    const asset = await supabase.createAsset(
      req.params.pageId,
      type,
      content,
      position || { x: 0, y: 0 }
    );

    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update asset position
app.patch('/api/admin/assets/:id/position', authMiddleware, async (req, res) => {
  try {
    const { position } = req.body;
    const asset = await supabase.updateAssetPosition(req.params.id, position);
    res.json(asset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete asset
app.delete('/api/admin/assets/:id', authMiddleware, async (req, res) => {
  try {
    await supabase.deleteAsset(req.params.id);
    res.json({ message: 'Asset deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update navigation
app.post('/api/admin/navigation', authMiddleware, async (req, res) => {
  try {
    const { label, url, orderIndex } = req.body;
    
    const link = await supabase.upsertNavigationLink(label, url, orderIndex);
    res.json(link);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
