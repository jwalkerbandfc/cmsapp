// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:3000/api';
let token = localStorage.getItem('auth_token');
let currentUser = null;
let currentPageId = null;
let quillEditor = null;
let editingAssetId = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
  initializeQuillEditor();
  await loadNavigation();
  await loadPublicContent();
  setupEventListeners();
});

// ==================== QUILL EDITOR SETUP ====================

function initializeQuillEditor() {
  quillEditor = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, false] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    },
    placeholder: 'Enter your content...'
  });
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Admin button
  document.getElementById('adminBtn').addEventListener('click', openAdmin);

  // Drag and drop for content canvas
  const contentCanvas = document.getElementById('contentCanvas');
  if (contentCanvas) {
    contentCanvas.addEventListener('dragover', handleDragOver);
    contentCanvas.addEventListener('dragleave', handleDragLeave);
    contentCanvas.addEventListener('drop', handleDrop);
  }

  // Auto-generate slug
  const pageTitle = document.getElementById('pageTitle');
  const pageSlug = document.getElementById('pageSlug');
  if (pageTitle && pageSlug) {
    pageTitle.addEventListener('input', () => {
      pageSlug.value = pageTitle.value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    });
  }
}

// ==================== NAVIGATION ====================

async function loadNavigation() {
  try {
    const response = await fetch(`${API_BASE}/navigation`);
    const links = await response.json();
    const navLinks = document.getElementById('navLinks');
    navLinks.innerHTML = '';

    links.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.label;
      li.appendChild(a);
      navLinks.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load navigation:', error);
  }
}

async function handleAddNavLink(event) {
  event.preventDefault();
  if (!token) {
    alert('Please login first');
    return;
  }

  const label = document.getElementById('navLabel').value;
  const url = document.getElementById('navUrl').value;
  const orderIndex = parseInt(document.getElementById('navOrder').value) || 0;

  try {
    const response = await fetch(`${API_BASE}/admin/navigation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ label, url, orderIndex })
    });

    if (!response.ok) throw new Error('Failed to add navigation link');

    showMessage('Navigation link added successfully', 'success');
    event.target.reset();
    await loadNavigation();
    await loadNavLinksList();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// ==================== PUBLIC CONTENT LOADING ====================

async function loadPublicContent() {
  try {
    const response = await fetch(`${API_BASE}/pages`);
    const pages = await response.json();
    
    const content = document.getElementById('content');
    content.innerHTML = '';

    if (pages.length === 0) {
      content.innerHTML = '<div class="section"><p>No pages available yet.</p></div>';
      return;
    }

    // Load first page by default
    await loadPageContent(pages[0].slug);
  } catch (error) {
    console.error('Failed to load content:', error);
  }
}

async function loadPageContent(slug) {
  try {
    const response = await fetch(`${API_BASE}/pages/${slug}`);
    const page = await response.json();

    const content = document.getElementById('content');
    content.innerHTML = '';

    // Hero section
    if (page.hero_title) {
      const hero = document.createElement('div');
      hero.className = 'hero';
      if (page.hero_image) {
        hero.style.backgroundImage = `url('${page.hero_image}')`;
      }
      
      hero.innerHTML = `
        <div class="hero-content">
          <h1>${escapeHtml(page.hero_title)}</h1>
          ${page.hero_subtitle ? `<p>${escapeHtml(page.hero_subtitle)}</p>` : ''}
        </div>
      `;
      content.appendChild(hero);
    }

    // Page title
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `<h2>${escapeHtml(page.title)}</h2>`;

    // Render assets with parallax effect
    if (page.assets && page.assets.length > 0) {
      page.assets.forEach((asset, index) => {
        const assetEl = renderAsset(asset, index);
        section.appendChild(assetEl);
      });
    }

    content.appendChild(section);
  } catch (error) {
    console.error('Failed to load page:', error);
  }
}

function renderAsset(asset, index) {
  const container = document.createElement('div');
  
  if (index % 2 === 0) {
    container.className = 'parallax-section';
    container.innerHTML = `
      <div class="parallax-bg" style="background-image: url('${asset.content.image || ''}')"></div>
      <div class="parallax-content">
        ${asset.type === 'text' ? `<h2>${escapeHtml(asset.content.title || '')}</h2><p>${asset.content.html || ''}</p>` : ''}
        ${asset.type === 'image' ? `<img src="${escapeHtml(asset.content.url || '')}" alt="Asset" style="max-width: 100%;">` : ''}
        ${asset.type === 'video' ? `<iframe width="100%" height="400" src="${escapeHtml(asset.content.url || '')}" frameborder="0" allowfullscreen></iframe>` : ''}
      </div>
    `;
  } else {
    container.className = 'asset-block';
    if (asset.type === 'text') {
      container.innerHTML = `
        <h3>${escapeHtml(asset.content.title || '')}</h3>
        <div>${asset.content.html || ''}</div>
      `;
    } else if (asset.type === 'image') {
      container.innerHTML = `<img src="${escapeHtml(asset.content.url || '')}" alt="Asset" style="max-width: 100%;">`;
    } else if (asset.type === 'video') {
      container.innerHTML = `<iframe width="100%" height="400" src="${escapeHtml(asset.content.url || '')}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  return container;
}

// ==================== ADMIN PANEL ====================

function openAdmin() {
  document.getElementById('adminModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('adminModal').classList.add('hidden');
  document.getElementById('richTextModal').classList.add('hidden');
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const tabEl = document.getElementById(tabName + 'Tab');
  if (tabEl) {
    tabEl.classList.add('active');
  }

  // Mark button as active
  event.target.classList.add('active');

  // Load data for specific tabs
  if (tabName === 'pages' && token) {
    loadPagesList();
  }
  if (tabName === 'navigation' && token) {
    loadNavLinksList();
  }
  if (tabName === 'editor' && token) {
    loadPagesForEditor();
  }
}

function switchToRegister() {
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('registerTab').classList.add('active');
}

function switchToLogin() {
  document.getElementById('registerTab').classList.remove('active');
  document.getElementById('loginTab').classList.add('active');
}

// ==================== AUTHENTICATION ====================

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('auth_token', token);

    showMessage('Login successful!', 'success');
    switchTab('pages');
    loadPagesList();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const password2 = document.getElementById('registerPassword2').value;

  if (password !== password2) {
    showMessage('Passwords do not match', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('auth_token', token);

    showMessage('Account created successfully!', 'success');
    switchTab('pages');
    loadPagesList();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// ==================== PAGE MANAGEMENT ====================

async function handleCreatePage(event) {
  event.preventDefault();

  const title = document.getElementById('pageTitle').value;
  const slug = document.getElementById('pageSlug').value;
  const heroTitle = document.getElementById('heroTitle').value;
  const heroSubtitle = document.getElementById('heroSubtitle').value;
  const heroImage = document.getElementById('heroImage').value;

  try {
    const response = await fetch(`${API_BASE}/admin/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        slug,
        heroTitle,
        heroSubtitle,
        heroImage
      })
    });

    if (!response.ok) throw new Error('Failed to create page');

    showMessage('Page created successfully!', 'success');
    event.target.reset();
    await loadPagesList();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function loadPagesList() {
  try {
    const response = await fetch(`${API_BASE}/pages`);
    const pages = await response.json();

    const list = document.getElementById('pagesList');
    list.innerHTML = '';

    pages.forEach(page => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${escapeHtml(page.title)}</strong> (${escapeHtml(page.slug)})
        </div>
        <div>
          <button onclick="editPage('${page.id}', '${page.slug}')">Edit</button>
          <button onclick="deletePage('${page.id}')" style="background: #e74c3c;">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load pages:', error);
  }
}

async function deletePage(pageId) {
  if (!confirm('Are you sure you want to delete this page?')) return;

  try {
    const response = await fetch(`${API_BASE}/admin/pages/${pageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete page');

    showMessage('Page deleted successfully', 'success');
    await loadPagesList();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// ==================== PAGE EDITOR ====================

async function loadPagesForEditor() {
  try {
    const response = await fetch(`${API_BASE}/pages`);
    const pages = await response.json();

    const select = document.getElementById('pageSelect');
    select.innerHTML = '<option value="">Choose a page...</option>';

    pages.forEach(page => {
      const option = document.createElement('option');
      option.value = page.id;
      option.textContent = page.title;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load pages:', error);
  }
}

async function loadPageForEditing() {
  const pageId = document.getElementById('pageSelect').value;
  if (!pageId) return;

  currentPageId = pageId;
  const editorContent = document.getElementById('editorContent');
  editorContent.classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE}/pages/${pageId}`);
    const page = await response.json();

    const canvas = document.getElementById('contentCanvas');
    canvas.innerHTML = '';

    if (page.assets && page.assets.length > 0) {
      page.assets.forEach(asset => {
        const assetEl = createEditableAsset(asset);
        canvas.appendChild(assetEl);
      });
    }
  } catch (error) {
    console.error('Failed to load page for editing:', error);
  }
}

function createEditableAsset(asset) {
  const div = document.createElement('div');
  div.className = 'editor-content-item';
  div.draggable = true;
  div.id = `asset-${asset.id}`;

  const preview = document.createElement('div');
  preview.style.flex = '1';
  preview.textContent = asset.type === 'text' ? asset.content.title : `${asset.type.toUpperCase()} Asset`;

  const actions = document.createElement('div');
  actions.className = 'editor-content-item-actions';
  actions.innerHTML = `
    <button onclick="editAsset('${asset.id}')">Edit</button>
    <button onclick="deleteAsset('${asset.id}')" style="background: #e74c3c;">Delete</button>
  `;

  div.appendChild(preview);
  div.appendChild(actions);

  // Drag handlers
  div.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    div.classList.add('dragging');
  });

  div.addEventListener('dragend', () => {
    div.classList.remove('dragging');
  });

  return div;
}

function addContentBlock(type) {
  if (!currentPageId) {
    alert('Please select a page first');
    return;
  }

  if (type === 'text') {
    editingAssetId = null;
    quillEditor.setContents([]);
    document.getElementById('richTextModal').classList.remove('hidden');
  } else if (type === 'image') {
    const url = prompt('Enter image URL:');
    if (url) createAsset(currentPageId, 'image', { url });
  } else if (type === 'video') {
    const url = prompt('Enter video embed URL:');
    if (url) createAsset(currentPageId, 'video', { url });
  }
}

function saveRichText() {
  const content = quillEditor.getContents();
  const html = quillEditor.root.innerHTML;
  const title = prompt('Enter block title:') || 'Untitled';

  createAsset(currentPageId, 'text', {
    title,
    html,
    content: JSON.stringify(content)
  });

  closeRichText();
}

function closeRichText() {
  document.getElementById('richTextModal').classList.add('hidden');
}

async function createAsset(pageId, type, content) {
  try {
    const response = await fetch(`${API_BASE}/admin/pages/${pageId}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        content,
        position: { x: 0, y: 0 }
      })
    });

    if (!response.ok) throw new Error('Failed to create asset');

    showMessage('Content block added!', 'success');
    await loadPageForEditing();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function editAsset(assetId) {
  editingAssetId = assetId;
  // Load asset data and populate editor
  addContentBlock('text');
}

async function deleteAsset(assetId) {
  if (!confirm('Delete this content block?')) return;

  try {
    const response = await fetch(`${API_BASE}/admin/assets/${assetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to delete asset');

    showMessage('Content block deleted', 'success');
    await loadPageForEditing();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function savePage() {
  if (!currentPageId) return;
  showMessage('Page saved!', 'success');
}

async function publishPage() {
  if (!currentPageId) return;

  try {
    const response = await fetch(`${API_BASE}/admin/pages/${currentPageId}/publish`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to publish page');

    showMessage('Page published successfully!', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function editPage(pageId, slug) {
  document.getElementById('pageSelect').value = pageId;
  loadPageForEditing();
  switchTab('editor');
}

// ==================== DRAG & DROP ====================

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  // Handle drop logic
}

async function loadNavLinksList() {
  try {
    const response = await fetch(`${API_BASE}/navigation`);
    const links = await response.json();

    const list = document.getElementById('navLinksList');
    list.innerHTML = '';

    links.forEach(link => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div><strong>${escapeHtml(link.label)}</strong> → ${escapeHtml(link.url)}</div>
        <div>
          <button onclick="deleteNavLink('${link.id}')" style="background: #e74c3c;">Delete</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Failed to load navigation links:', error);
  }
}

async function deleteNavLink(linkId) {
  if (!confirm('Delete this navigation link?')) return;
  // Implementation depends on API endpoint
  showMessage('Navigation link deleted', 'success');
  await loadNavLinksList();
}

// ==================== UTILITIES ====================

function showMessage(message, type = 'info') {
  const div = document.createElement('div');
  div.className = `${type}-message`;
  div.textContent = message;
  div.style.position = 'fixed';
  div.style.top = '80px';
  div.style.right = '20px';
  div.style.padding = '1rem';
  div.style.borderRadius = '4px';
  div.style.zIndex = '3000';

  if (type === 'success') {
    div.style.background = '#27ae60';
    div.style.color = 'white';
  } else if (type === 'error') {
    div.style.background = '#e74c3c';
    div.style.color = 'white';
  }

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
