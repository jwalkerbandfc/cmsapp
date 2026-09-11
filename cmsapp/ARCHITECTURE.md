# 🏗️ Architecture & Design Patterns

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Public)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ HTML/CSS/JavaScript - Responsive, Mobile-First      │  │
│  │ - Hero sections with parallax                       │  │
│  │ - Drag-drop content blocks                          │  │
│  │ - Rich text editor (Quill.js)                       │  │
│  │ - Navigation management UI                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (REST)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Express.js Routes                                     │  │
│  │ - Public endpoints (GET pages, navigation)          │  │
│  │ - Protected endpoints (admin operations)             │  │
│  │ - Authentication endpoints (login, register)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│                Business Logic Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services with Decorators                             │  │
│  │ - @LogExecution - Automatic logging                 │  │
│  │ - @CacheResult - Result caching                     │  │
│  │ - @ValidateInput - Input validation                │  │
│  │ - Authentication Manager                            │  │
│  │ - Supabase Client (DB operations)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
├─────────────────────────────────────────────────────────────┤
│              Database Layer (Supabase)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PostgreSQL with Real-time capabilities              │  │
│  │ Tables: pages, assets, navigation, admin_users      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Decorator Pattern Implementation

Decorators wrap functions to add behavior without modifying the original function.

### 1. LogExecution Decorator

**Purpose**: Automatically logs method execution time and results

```javascript
// Usage
class PageService {
  @LogExecution
  async getPageById(id) {
    // Your code
  }
}

// Output
// [2024-01-15T10:30:45.123Z] [PageService] [INFO] Executing getPageById
// [2024-01-15T10:30:45.200Z] [PageService] [DEBUG] getPageById completed {duration: "77ms"}
```

**Implementation**:
```javascript
export function LogExecution(target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  const logger = new Logger(target.constructor.name);

  descriptor.value = async function(...args) {
    const startTime = Date.now();
    logger.info(`Executing ${propertyKey}`, { args: args.slice(0, 2) });
    
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;
      logger.debug(`${propertyKey} completed`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      logger.error(`${propertyKey} failed`, { error: error.message });
      throw error;
    }
  };
  return descriptor;
}
```

### 2. CacheResult Decorator

**Purpose**: Caches method results with TTL (time-to-live)

```javascript
// Usage
class NavigationService {
  @CacheResult(3600000)  // Cache for 1 hour
  async getNavigationLinks() {
    return await this.supabase.getNavigationLinks();
  }
}

// First call: Database query (slow)
// Subsequent calls (within TTL): Cached result (fast)
```

**Benefits**:
- Reduces database queries
- Faster response times
- Automatic cache invalidation after TTL

### 3. ValidateInput Decorator

**Purpose**: Validates input before method execution

```javascript
// Usage
class AuthService {
  @ValidateInput(validateEmail)
  async register(email, password) {
    // email is guaranteed to be valid
  }
}

// Validator function
function validateEmail(input) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(input)) {
    throw new Error('Invalid email format');
  }
}
```

## Module Architecture

### src/logger.js
**Responsibility**: Logging and decorators

```
Logger (class)
├── format()           - Format log messages
├── error()           - Error level logging
├── warn()            - Warning level logging
├── info()            - Info level logging
└── debug()           - Debug level logging

Decorators
├── @LogExecution     - Track execution & performance
├── @CacheResult      - Cache method results
└── @ValidateInput    - Validate inputs
```

### src/auth.js
**Responsibility**: Authentication and authorization

```
AuthManager (class)
├── hashPassword()    - Hash passwords with bcrypt
├── comparePassword() - Verify passwords
├── generateToken()   - Create JWT tokens
├── verifyToken()     - Validate JWT tokens
├── register()        - Create new admin user
└── login()           - Authenticate user

Middleware
└── createAuthMiddleware() - Express middleware for protected routes
```

### src/supabaseClient.js
**Responsibility**: Database operations

```
SupabaseClient (class)
├── Pages
│   ├── createPage()
│   ├── updatePage()
│   ├── getPage()
│   ├── getAllPages()
│   └── deletePage()
├── Navigation
│   ├── upsertNavigationLink()
│   └── getNavigationLinks()
├── Assets
│   ├── createAsset()
│   ├── getPageAssets()
│   ├── updateAssetPosition()
│   └── deleteAsset()
└── Admin Users
    ├── getAdminUser()
    └── createAdminUser()
```

### src/index.js
**Responsibility**: Express server and API routes

```
Routes
├── Public Routes
│   ├── GET  /api/pages
│   ├── GET  /api/pages/:slug
│   └── GET  /api/navigation
├── Auth Routes
│   ├── POST /api/auth/register
│   └── POST /api/auth/login
├── Protected Routes (require JWT)
│   ├── POST   /api/admin/pages
│   ├── PUT    /api/admin/pages/:id
│   ├── PATCH  /api/admin/pages/:id/publish
│   ├── DELETE /api/admin/pages/:id
│   ├── POST   /api/admin/pages/:id/assets
│   ├── PATCH  /api/admin/assets/:id/position
│   ├── DELETE /api/admin/assets/:id
│   └── POST   /api/admin/navigation
└── Health Check
    └── GET /health
```

## Data Flow Diagrams

### Authentication Flow

```
User Input (Login Form)
    ↓
Frontend (app.js)
    ↓
POST /api/auth/login
    ↓
Express Router
    ↓
AuthManager.login()
    ├─ Get user from Supabase
    ├─ Compare password (bcrypt)
    └─ Generate JWT token
    ↓
Return {user, token}
    ↓
Frontend stores token in localStorage
    ↓
Token sent in Authorization header for protected routes
```

### Page Creation Flow

```
Admin fills form (index.html)
    ↓
handleCreatePage(event)
    ↓
POST /api/admin/pages
    (with JWT token in Authorization header)
    ↓
Express Route Handler
    ↓
authMiddleware (verify JWT)
    ↓
SupabaseClient.createPage()
    ├─ Insert into pages table
    └─ Return page object
    ↓
Response: 201 Created
    ↓
Frontend refreshes page list
```

### Content Rendering Flow

```
User visits public page
    ↓
GET /api/pages/:slug
    ↓
SupabaseClient.getPage()
    ├─ Query pages table
    ├─ Return page with assets
    └─ (May be cached via @CacheResult)
    ↓
SupabaseClient.getPageAssets()
    ├─ Query assets table
    └─ Return all assets for page
    ↓
Response: {page, assets}
    ↓
Frontend renders with parallax effects
    ↓
Display on public page
```

## Security Architecture

### Authentication Strategy

```
┌─────────────┐
│   User      │
│             │
└──────┬──────┘
       │ 1. Register/Login
       ↓
┌──────────────────────┐
│  AuthManager         │
│ - Hash password      │
│ - Generate JWT       │
└──────┬───────────────┘
       │ 2. Return JWT token
       ↓
┌──────────────────────┐
│  Frontend            │
│ - Store in localStorage
│ - Add to headers     │
└──────┬───────────────┘
       │ 3. Send JWT with request
       ↓
┌──────────────────────┐
│  authMiddleware      │
│ - Verify JWT         │
│ - Attach user to req │
└──────┬───────────────┘
       │ 4. Allow/Deny
       ↓
  Protected Route
```

### Password Security

```
User Password: "MySecurePassword123"
    ↓
Salt generated (10 rounds)
    ↓
Hash = bcrypt("MySecurePassword123", salt)
    ↓
Store in database: {email, password_hash}

Later:
User enters password on login
    ↓
Compare: bcrypt.compare(input, stored_hash)
    ↓
Returns true/false (one-way)
    ↓
If true: Generate JWT and return
```

## Database Schema

### Pages Table
```sql
pages {
  id: UUID (primary key)
  title: VARCHAR          -- Page title
  slug: VARCHAR (unique)  -- URL-friendly name
  content: JSONB         -- Flexible content storage
  hero_title: VARCHAR    -- Hero section title
  hero_subtitle: VARCHAR -- Hero section subtitle
  hero_image: VARCHAR    -- Hero background image URL
  is_published: BOOLEAN  -- Public visibility
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### Assets Table
```sql
assets {
  id: UUID (primary key)
  page_id: UUID (foreign key) → pages.id
  type: VARCHAR          -- 'text', 'image', 'video'
  content: JSONB        -- Flexible content storage
  position: JSONB       -- {x, y} coordinates
  created_at: TIMESTAMP
}
```

### Navigation Links Table
```sql
navigation_links {
  id: UUID (primary key)
  label: VARCHAR        -- Display text
  url: VARCHAR         -- Link destination
  order_index: INTEGER -- Sort order
  created_at: TIMESTAMP
}
```

### Admin Users Table
```sql
admin_users {
  id: UUID (primary key)
  email: VARCHAR (unique)    -- Login email
  password_hash: VARCHAR     -- Bcrypt hashed
  is_active: BOOLEAN        -- Account status
  created_at: TIMESTAMP
}
```

## Frontend Architecture

### Page Rendering

```javascript
// 1. Load navigation
loadNavigation() → GET /api/navigation

// 2. Load published pages
loadPublicContent() → GET /api/pages

// 3. Render first page
loadPageContent(slug) → GET /api/pages/:slug

// 4. Parse assets by type
assets.map(asset => renderAsset(asset))

// 5. Apply parallax effects (CSS)
background-attachment: fixed

// 6. Add animations
fadeIn, fadeInUp animations
```

### Admin Panel State Management

```
currentUser: {id, email, token}
currentPageId: UUID
editingAssetId: UUID
quillEditor: Quill instance
token: JWT from localStorage

Actions:
- Login → set currentUser, token
- Create page → currentPageId
- Edit content → editingAssetId
- Save → push to API
```

## Error Handling Strategy

### Backend

```javascript
Try-Catch Blocks
    ↓
Logger.error()
    ↓
Response with status code
    ├─ 400: Bad request
    ├─ 401: Unauthorized
    ├─ 403: Forbidden
    ├─ 404: Not found
    └─ 500: Server error
```

### Frontend

```javascript
Fetch error
    ↓
Check response.ok
    ↓
Parse error from response.json()
    ↓
showMessage(error, 'error')
    ↓
Display in UI for 3 seconds
```

## Performance Optimizations

### Caching Strategy

```
Database Query
    ↓
    ├─ First request: Query DB, store in cache
    └─ Subsequent requests (within TTL): Return cached
    
TTL Examples:
- Navigation links: 1 hour (stable)
- Published pages: 1 hour (stable)
- User data: 5 minutes (might change)
```

### Frontend Optimizations

```
- Parallax images use background-attachment: fixed
- CSS minification on production
- Lazy-loaded asset loading
- Event delegation for drag-drop
- localStorage for auth token (avoid repeated login)
```

## Deployment Architecture

### Development
```
npm run dev
    ↓
node src/index.js
    ↓
Express server (port 3000)
    ↓
Serves public/ static files
```

### Docker Production
```
Dockerfile
    ↓
docker build -t app .
    ↓
docker run -e SUPABASE_URL=... app
    ↓
Multi-stage build (node modules separate)
    ↓
Non-root user (security)
    ↓
Health check endpoint
```

### Cloudflare Workers
```
wrangler.toml
    ↓
npm run deploy
    ↓
Bundles code for workers
    ↓
Runs on Cloudflare edge
    ↓
Global distribution (low latency)
```

## Extending the System

### Adding New Decorator

```javascript
export function MyDecorator(target, propertyKey, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = async function(...args) {
    // Before logic
    console.log(`Starting ${propertyKey}`);
    
    try {
      const result = await original.apply(this, args);
      
      // After logic
      console.log(`Finished ${propertyKey}`);
      return result;
    } catch (error) {
      // Error logic
      throw error;
    }
  };
  
  return descriptor;
}
```

### Adding New API Endpoint

```javascript
// In src/index.js
app.post('/api/admin/custom', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const result = await supabase.customMethod(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Reusable code with decorators
- ✅ Security at multiple layers
- ✅ Easy testing and debugging
- ✅ Simple to extend and modify
- ✅ Production-ready
