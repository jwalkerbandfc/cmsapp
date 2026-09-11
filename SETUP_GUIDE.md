# 🚀 Complete Setup Guide - Asset CMS

This guide walks you through setting up the Asset Management CMS from scratch. No experience needed!

## Phase 1: Prerequisites (5 minutes)

### What You Need

1. **Node.js** - Programming environment
   - Download from [nodejs.org](https://nodejs.org)
   - Choose "LTS" (Long Term Support) version
   - Install and verify: `node --version` in terminal

2. **Git** - Version control (optional but recommended)
   - Download from [git-scm.com](https://git-scm.com)
   - Or just download this project as ZIP

3. **Text Editor** - For editing code
   - [VS Code](https://code.visualstudio.com) (recommended)
   - Or any text editor you prefer

4. **Terminal** - Command line interface
   - Windows: Command Prompt or PowerShell
   - Mac: Terminal app
   - Linux: Any terminal

## Phase 2: Supabase Setup (10 minutes)

Supabase is where your data lives. Think of it as your database.

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with email or GitHub
4. Create a new organization (or use default)
5. Create a new project:
   - Name: `asset-cms` (or anything you want)
   - Database Password: Create strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project"

⏳ Wait 2-3 minutes for project to initialize...

### Step 2: Get Your API Keys

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API**
3. You'll see:
   - **Project URL** - Copy this
   - **Project API Key (anon public)** - Copy this
4. Keep these handy for next step

## Phase 3: Project Setup (10 minutes)

### Step 1: Download Project

```bash
# Option A: Using Git
git clone <project-url>
cd cms-system

# Option B: Download ZIP
# Extract to folder, open terminal in that folder
```

### Step 2: Install Dependencies

```bash
npm install
```

⏳ This downloads required packages (takes 1-2 minutes)

### Step 3: Configure Environment

```bash
# Copy template
cp .env.example .env

# Open .env in your text editor
```

Fill in these values:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
JWT_SECRET=your-secret-key-here
```

**Where to find:**
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: From Supabase Project Settings → API
- `JWT_SECRET`: Any long random string (min 32 characters)

Example:
```
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=my-super-secret-key-that-is-very-long-and-random-12345
```

## Phase 4: Running the Server (2 minutes)

### Start Development Server

```bash
npm run dev
```

You should see:
```
[timestamp] [Server] [INFO] Server running on port 3000
```

### Access the Application

Open your browser and go to:
```
http://localhost:3000
```

✅ You should see the Asset CMS homepage!

## Phase 5: First Time Setup (5 minutes)

### Create Admin Account

1. Click **Admin** button (top right)
2. Click **Register** tab
3. Enter:
   - Email: `admin@example.com`
   - Password: Something secure
   - Confirm password
4. Click **Create Account**

✅ You're logged in!

### Create Your First Page

1. Click **Pages** tab
2. Fill in:
   - Page Title: `Welcome`
   - URL Slug: `welcome` (auto-fills)
   - Hero Title: `Welcome to My CMS`
   - Hero Subtitle: `Build amazing pages`
   - Hero Image: (leave blank for now)
3. Click **Create Page**

### Add Content to Page

1. Click **Edit Page** tab
2. Select your page from dropdown
3. Click **Add Text** button
4. Type your content in rich editor
5. Click **Save**
6. Click **Publish Page**

### Access Your Public Page

Open: `http://localhost:3000/pages/welcome`

✅ Your page is live!

## Phase 6: Navigation Setup (2 minutes)

### Add Navigation Links

1. Click **Navigation** tab
2. Add links:
   - Label: `Home`, URL: `/`
   - Label: `Welcome`, URL: `/pages/welcome`
   - Label: `Contact`, URL: `/contact`
3. Click **Add Link** for each one

Your navigation appears at top automatically!

## Phase 7: Deployment Options

### Option A: Simple Hosting (Heroku, Railway)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"

# Then connect to Heroku/Railway via their dashboard
```

### Option B: Docker (Recommended)

```bash
# Build image
docker build -t my-cms .

# Run container
docker run -p 3000:3000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  -e JWT_SECRET=your-secret \
  my-cms
```

### Option C: Cloudflare Workers

```bash
# Install Wrangler
npm install -g @cloudflare/wrangler

# Login
wrangler login

# Update wrangler.toml with your settings

# Deploy
npm run deploy
```

## Troubleshooting

### "Cannot find module..."
```bash
npm install
```

### "SUPABASE_URL is required"
Check `.env` file has correct values. Restart server.

### Server won't start
Make sure port 3000 is not in use:
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it (Mac/Linux)
kill -9 <PID>

# On Windows, use Task Manager
```

### Can't login
1. Clear browser cache
2. Make sure account was created
3. Check password is correct

### Content not saving
1. Check browser console (F12) for errors
2. Check Supabase connection
3. Verify JWT_SECRET in `.env`

## Next Steps

### Learn the System
1. Read the main [README.md](README.md)
2. Explore the admin panel
3. Try different content types (text, images, videos)

### Customize
1. Edit `public/styles.css` for colors/fonts
2. Modify `public/index.html` for layout
3. Add new decorators in `src/logger.js`

### Add Features
1. Email notifications
2. User comments
3. Search functionality
4. Analytics

## Useful Commands

```bash
# Start development server
npm run dev

# Stop server
Ctrl + C

# Install new package
npm install package-name

# See logs
npm run dev

# Clean cache
rm -rf node_modules
npm install

# Check health
curl http://localhost:3000/health
```

## File Structure Quick Reference

```
📁 cms-system/
├── 📁 src/               ← Backend code
│   ├── index.js         ← Main server
│   ├── auth.js          ← Login system
│   ├── logger.js        ← Logging
│   └── supabaseClient.js ← Database
├── 📁 public/           ← Frontend code
│   ├── index.html       ← Web page
│   ├── app.js           ← JavaScript
│   └── styles.css       ← Styling
├── 📄 .env              ← Your secrets (don't share!)
├── 📄 package.json      ← Dependencies
└── 📄 README.md         ← Full documentation
```

## Security Checklist

Before going live:

- [ ] Change JWT_SECRET to something random
- [ ] Use strong admin password
- [ ] Update ALLOWED_ORIGINS in .env
- [ ] Enable HTTPS on hosting platform
- [ ] Keep Node.js updated
- [ ] Don't share .env file
- [ ] Backup your database regularly

## Getting Help

1. Check [README.md](README.md) for detailed docs
2. Check [Supabase docs](https://supabase.com/docs)
3. Check [Express.js guide](https://expressjs.com)
4. Google the error message
5. Ask in forums/communities

## Success! 🎉

You now have a working CMS! 

Next: Customize it for your needs and deploy to production.

Happy building! 🚀
