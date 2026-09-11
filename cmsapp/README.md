# Asset Management CMS System

A modern, modular content management system built with Node.js, featuring decorator-based architecture, Supabase backend, and Cloudflare Workers deployment capability.

## 🎯 Features

- **Modular Architecture**: Uses decorator pattern for clean, reusable code
- **Drag & Drop Interface**: Easy content management with visual drag-drop editor
- **Rich Text Editor**: Quill.js integration for formatted content creation
- **Responsive Design**: Mobile-first responsive web pages
- **Parallax Effects**: Beautiful parallax scrolling throughout site
- **Hero Section**: Eye-catching hero/jumbotron on pages
- **Admin Authentication**: Secure JWT-based admin panel
- **Navigation Management**: Easy top navigation link management
- **Asset Management**: Organize images, videos, and text content
- **Supabase Backend**: Scalable PostgreSQL database
- **Cloudflare Workers**: Serverless deployment ready
- **Logging System**: Comprehensive logging with decorators

## 📋 Requirements

- Node.js 16+
- npm or yarn
- Supabase account (free tier available)
- Cloudflare account (optional, for deployment)

## 🚀 Quick Start

### 1. Setup

```bash
# Clone or extract the project
cd cms-system

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 2. Configure Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Project Settings → API
4. Copy `Project URL` and `anon public key`
5. Update `.env` file:

```bash
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set JWT Secret

```bash
# Generate a secure secret (or use any strong string)
JWT_SECRET=your-super-secret-key-min-32-characters
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## 📁 Project Structure

```
cms-system/
├── src/
│   ├── index.js              # Main Express server
│   ├── logger.js             # Logging system with decorators
│   ├── supabaseClient.js     # Supabase integration
│   └── auth.js               # Authentication manager
├── public/
│   ├── index.html            # Frontend HTML
│   ├── styles.css            # Responsive styling
│   └── app.js                # Frontend JavaScript
├── package.json              # Dependencies
├── wrangler.toml            # Cloudflare Workers config
├── .env.example             # Environment template
└── README.md                # This file
```

## 🏗️ Architecture Overview

### Backend Architecture

**Decorator Pattern Implementation**:
- `@LogExecution`: Automatically logs method execution and performance
- `@CacheResult`: Caches method results with TTL
- `@ValidateInput`: Validates input before processing

**Modular Modules**:
```javascript
// Logger with decorators
class MyService {
  @LogExecution
  @CacheResult(3600000)
  async getPageData(id) {
    // Logic here
  }
}
```

### API Endpoints

**Public Routes**:
```
GET  /api/pages              # Get all published pages
GET  /api/pages/:slug        # Get page by slug
GET  /api/navigation         # Get navigation links
```

**Authentication**:
```
POST /api/auth/register      # Create admin account
POST /api/auth/login         # Login admin user
```

**Protected Admin Routes** (require JWT token):
```
POST   /api/admin/pages                    # Create page
PUT    /api/admin/pages/:id                # Update page
PATCH  /api/admin/pages/:id/publish        # Publish page
DELETE /api/admin/pages/:id                # Delete page

POST   /api/admin/pages/:pageId/assets     # Add asset
PATCH  /api/admin/assets/:id/position      # Update position
DELETE /api/admin/assets/:id               # Delete asset

POST   /api/admin/navigation                # Add nav link
```

## 🎨 Frontend Features

### Admin Panel

**Tabs**:
1. **Login**: JWT authentication
2. **Pages**: Create, edit, publish, delete pages
3. **Navigation**: Manage top navigation links
4. **Editor**: Visual page content editor with drag-drop

### Page Editor

- Drag-and-drop content blocks
- Rich text editor with Quill.js
- Image and video embedding
- Position management
- Live preview on public pages

### Public Pages

- Hero section with background image
- Parallax scrolling sections
- Responsive mobile design
- Smooth animations
- Navigation breadcrumbs

## 🔐 Security

### Authentication
- Bcrypt password hashing (10 salt rounds)
- JWT tokens with configurable expiration
- Secure token storage in localStorage
- CORS protection
- Protected API endpoints

### Best Practices
```javascript
// Example: Using decorators for security
@LogExecution
@ValidateInput(validateEmail)
async register(email, password) {
  const hash = await this.hashPassword(password);
  // Store securely...
}
```

## 📝 Database Schema

### Pages Table
```sql
- id (UUID, primary key)
- title (VARCHAR)
- slug (VARCHAR, unique)
- content (JSONB)
- hero_title (VARCHAR)
- hero_subtitle (VARCHAR)
- hero_image (VARCHAR)
- is_published (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Navigation Links Table
```sql
- id (UUID, primary key)
- label (VARCHAR)
- url (VARCHAR)
- order_index (INTEGER)
- created_at (TIMESTAMP)
```

### Assets Table
```sql
- id (UUID, primary key)
- page_id (UUID, foreign key)
- type (VARCHAR): 'text', 'image', 'video'
- content (JSONB)
- position (JSONB)
- created_at (TIMESTAMP)
```

### Admin Users Table
```sql
- id (UUID, primary key)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

## ☁️ Deployment

### Cloudflare Workers

```bash
# 1. Login to Cloudflare
wrangler login

# 2. Update wrangler.toml with your settings
# - Set your domain
# - Set KV namespace IDs
# - Set environment variables

# 3. Deploy
npm run deploy
```

### Traditional Node.js Server

```bash
# Build for production
npm run build

# Set environment to production
NODE_ENV=production PORT=8080 npm start
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Usage Examples

### Creating a Page

```javascript
// Via API
POST /api/admin/pages
{
  "title": "About Us",
  "slug": "about",
  "heroTitle": "Our Story",
  "heroSubtitle": "Learn more about our mission",
  "heroImage": "https://example.com/hero.jpg"
}
```

### Adding Content

```javascript
// Add text block
POST /api/admin/pages/{pageId}/assets
{
  "type": "text",
  "content": {
    "title": "Section Title",
    "html": "<p>Content here</p>",
    "content": "..."
  },
  "position": { "x": 0, "y": 0 }
}

// Add image
POST /api/admin/pages/{pageId}/assets
{
  "type": "image",
  "content": {
    "url": "https://example.com/image.jpg"
  }
}
```

## 🧪 Testing

### Test Admin Account

```bash
# Create admin user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }'

# Response includes token
```

## 🔧 Extending the System

### Adding New Decorators

```javascript
// logger.js
export function MyDecorator(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args) {
    // Before logic
    const result = await originalMethod.apply(this, args);
    // After logic
    return result;
  };

  return descriptor;
}
```

### Adding New API Routes

```javascript
// index.js
app.get('/api/custom-endpoint', authMiddleware, async (req, res) => {
  try {
    const data = await supabase.customMethod();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px and up
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🎯 Performance Optimization

- CSS caching with decorators
- Lazy loading for parallax images
- Minified assets
- Gzip compression
- Database indexing on frequently queried fields

## 🐛 Troubleshooting

### Common Issues

**"SUPABASE_URL is required"**
- Check `.env` file has correct Supabase URL
- Ensure variables are loaded before initialization

**"Invalid token"**
- Token may have expired
- Check JWT_SECRET matches across environments
- Clear localStorage and login again

**CORS errors**
- Update ALLOWED_ORIGINS in `.env`
- Ensure frontend URL is whitelisted

**Assets not loading**
- Verify image/video URLs are accessible
- Check HTTPS vs HTTP consistency

## 📖 API Documentation

Full OpenAPI/Swagger documentation available at `/api/docs` (when enabled)

## 🤝 Contributing

1. Follow the decorator pattern for new features
2. Add logging via decorators
3. Write tests for new endpoints
4. Update README documentation

## 📄 License

MIT License - Feel free to use for personal or commercial projects

## 🎓 Learning Resources

- [Decorator Pattern](https://en.wikipedia.org/wiki/Decorator_pattern)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Express.js Guide](https://expressjs.com/)
- [Quill.js Rich Editor](https://quilljs.com/)

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review code comments
3. Check Supabase/Cloudflare documentation

---

**Happy CMS building! 🚀**
