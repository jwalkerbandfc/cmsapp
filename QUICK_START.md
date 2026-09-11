# 🎯 Asset CMS - Quick Start (5 Minutes)

## What You're Getting

A complete, production-ready content management system with:
- ✅ Modular Node.js backend with decorator pattern
- ✅ Secure JWT authentication
- ✅ Rich text editor for content
- ✅ Drag-and-drop interface
- ✅ Responsive mobile-first design
- ✅ Parallax scrolling effects
- ✅ Supabase PostgreSQL database
- ✅ Cloudflare Workers ready
- ✅ Docker deployable

## 1️⃣ Install (2 min)

```bash
# Install Node.js first from nodejs.org (LTS version)

# Then run:
npm install
```

## 2️⃣ Configure (2 min)

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Add your Supabase details:
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get `Project URL` and `anon key` from Settings → API
4. Paste into `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
JWT_SECRET=your-random-secret-key
```

## 3️⃣ Run (1 min)

```bash
npm run dev
```

Open browser: **http://localhost:3000**

## 4️⃣ Create Account (instant)

- Click **Admin** button
- Register admin account
- Create your first page
- Add content
- Publish!

## 📚 Full Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup (for beginners)
- **[README.md](README.md)** - Complete documentation
- **[API Endpoints](README.md#-api-endpoints)** - All available routes

## 🏗️ Project Structure

```
src/
├── index.js              # Main server
├── logger.js            # Logging with decorators
├── auth.js              # Authentication
└── supabaseClient.js    # Database

public/
├── index.html           # Web interface
├── app.js              # Frontend logic
└── styles.css          # Responsive design
```

## 🔑 Key Features

### Admin Panel (Logged In)
- Create/edit/delete pages
- Manage navigation links
- Rich text editor
- Drag-and-drop content
- Image & video embedding

### Public Pages
- Beautiful hero sections
- Parallax scrolling
- Responsive design
- Fast loading

### Technical
- Decorator pattern (clean code)
- JWT authentication (secure)
- Automatic logging
- Result caching
- Input validation

## 🚀 Deployment

### Docker
```bash
docker build -t my-cms .
docker run -p 3000:3000 -e SUPABASE_URL=... my-cms
```

### Cloudflare Workers
```bash
npm run deploy
```

### Traditional Hosting
```bash
NODE_ENV=production npm start
```

## 📝 Admin Panel Tabs

| Tab | Purpose |
|-----|---------|
| **Login** | Register/login admin |
| **Pages** | Create & manage pages |
| **Navigation** | Edit top menu links |
| **Editor** | Visual page editor |

## 🎨 Default Admin Credentials

Create your own on first visit! No default credentials.

## 💡 Example Usage

### Create a Page
1. Go to Pages tab
2. Enter title: "About Us"
3. Slug auto-fills: "about-us"
4. Add hero image URL
5. Click Create

### Add Content
1. Go to Editor tab
2. Select your page
3. Click "Add Text"
4. Write with rich editor
5. Click Save → Publish

### View Live
Visit: `http://localhost:3000/pages/about-us`

## 🔐 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Secure environment variables
- CORS protection
- Input validation
- SQL injection prevention

## ✨ Styling & Customization

Edit `public/styles.css`:

```css
:root {
  --primary: #2c3e50;      /* Main color */
  --secondary: #3498db;    /* Accent */
  --accent: #e74c3c;       /* Highlights */
}
```

## 🐛 Common Issues

**"SUPABASE_URL is required"**
→ Check `.env` has correct values

**"Cannot find module"**
→ Run `npm install`

**Server won't start**
→ Port 3000 in use? Try different port: `PORT=3001 npm run dev`

## 📞 Getting Help

1. Check error message
2. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Check [README.md](README.md) docs
4. Search error on Google

## 🎓 Learning

This project demonstrates:
- ✅ Decorator pattern in JavaScript
- ✅ Express.js backend
- ✅ JWT authentication
- ✅ RESTful API design
- ✅ Responsive CSS
- ✅ Rich text editing
- ✅ Drag & drop UI
- ✅ Database integration
- ✅ Docker deployment

Perfect for learning modern web development!

## 📦 What's Included

- **Backend**: Express.js, Supabase, JWT auth, decorators
- **Frontend**: Vanilla JavaScript, Quill editor, Drag & Drop
- **Styling**: Responsive CSS with parallax effects
- **Database**: Supabase PostgreSQL
- **Deployment**: Docker, Cloudflare Workers, traditional hosting

## ⚡ Performance

- Automatic caching with decorators
- Lazy-loaded parallax images
- Optimized CSS
- Gzip compression ready
- Database indexing included

## 🎉 Ready to Build?

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase keys
npm run dev
```

Visit: **http://localhost:3000**

Enjoy! 🚀

---

Need help? See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed step-by-step instructions.
