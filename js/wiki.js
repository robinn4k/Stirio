// ─── Wiki Module: Navigation, rendering, search, content display ─────
import { WIKI_CATEGORIES, WIKI_ARTICLES, TIMELINE_DATA, GLOSSARY_DATA } from './wiki-data.js';
import { mountScene, dispose, toggleAutoRotate, resetCamera } from './wiki-3d.js';
import { SCENE_BUILDERS } from './wiki-scenes.js';

let showView, t, toast;
let currentCategory = null;
let currentArticle = null;
let navStack = [];

// ─── Init: receive app-level helpers ─────────────────────────────────
export function initWiki(helpers) {
  showView = helpers.showView;
  t = helpers.t;
  toast = helpers.toast;
}

// ─── Render Wiki Hub ─────────────────────────────────────────────────
export function renderWikiHub() {
  navStack = [];
  dispose();

  const grid = document.getElementById('wiki-categories-grid');
  if (!grid) return;
  grid.innerHTML = '';

  WIKI_CATEGORIES.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'wiki-cat-card';
    card.style.background = cat.gradient;
    card.innerHTML = `
      <div class="wiki-cat-icon">${cat.icon}</div>
      <div class="wiki-cat-name">${t('wiki.cat.' + cat.id)}</div>
      <div class="wiki-cat-count">${cat.articles.length} ${t('wiki.articles')}</div>
      ${cat.has3d ? '<div class="wiki-cat-3d-badge">3D</div>' : ''}
    `;
    card.addEventListener('click', () => openCategory(cat.id));
    grid.appendChild(card);
  });

  // Mount hero 3D scene
  const heroCanvas = document.getElementById('wiki-hero-canvas');
  if (heroCanvas && SCENE_BUILDERS.hero) {
    try {
      mountScene(heroCanvas, (scene, camera, ctx) => {
        SCENE_BUILDERS.hero(scene, camera, ctx);
      });
    } catch (e) {
      console.warn('Wiki hero 3D failed:', e);
    }
  }

  showView('view-wiki-hub');
}

// ─── Open Category ───────────────────────────────────────────────────
export function openCategory(catId) {
  const cat = WIKI_CATEGORIES.find(c => c.id === catId);
  if (!cat) return;
  currentCategory = cat;
  navStack.push('view-wiki-hub');
  dispose();

  const title = document.getElementById('wiki-category-title');
  const desc = document.getElementById('wiki-category-desc');
  const list = document.getElementById('wiki-articles-list');

  if (title) title.textContent = `${cat.icon} ${t('wiki.cat.' + cat.id)}`;
  if (desc) desc.textContent = t('wiki.cat.' + cat.id + '.desc');
  if (!list) return;
  list.innerHTML = '';

  cat.articles.forEach(art => {
    const item = document.createElement('div');
    item.className = 'wiki-article-item';
    item.innerHTML = `
      <div class="wiki-article-item-icon">${art.icon}</div>
      <div class="wiki-article-item-info">
        <div class="wiki-article-item-name">${t('wiki.art.' + cat.id + '.' + art.id)}</div>
        <div class="wiki-article-item-sub">${t('wiki.art.' + cat.id + '.' + art.id + '.sub')}</div>
      </div>
      ${art.has3d ? '<div class="wiki-article-3d-tag">3D</div>' : ''}
      <div class="wiki-article-item-arrow">→</div>
    `;
    item.addEventListener('click', () => openArticle(cat.id, art.id));
    list.appendChild(item);
  });

  showView('view-wiki-category');
}

// ─── Open Article ────────────────────────────────────────────────────
export function openArticle(catId, artId) {
  const cat = WIKI_CATEGORIES.find(c => c.id === catId);
  if (!cat) return;
  const art = cat.articles.find(a => a.id === artId);
  if (!art) return;

  currentCategory = cat;
  currentArticle = art;
  navStack.push('view-wiki-category');
  dispose();

  const titleEl = document.getElementById('wiki-article-title');
  const bodyEl = document.getElementById('wiki-article-content');
  const viewport3d = document.getElementById('wiki-article-3d');
  const btnFullscreen = document.getElementById('btn-wiki-fullscreen-3d');

  if (titleEl) titleEl.textContent = `${art.icon} ${t('wiki.art.' + catId + '.' + artId)}`;

  // Show/hide 3D button
  if (btnFullscreen) btnFullscreen.style.display = art.has3d ? '' : 'none';

  // Render 3D viewport
  if (viewport3d) {
    viewport3d.style.display = art.has3d ? '' : 'none';
    if (art.has3d && art.scene && SCENE_BUILDERS[art.scene]) {
      try {
        mountScene(viewport3d, (scene, camera, ctx) => {
          const builder = SCENE_BUILDERS[art.scene];
          builder(scene, camera, ctx, art.sceneParams);
        });
      } catch (e) {
        console.warn('Article 3D failed:', e);
        viewport3d.innerHTML = '<div class="wiki-3d-fallback">3D</div>';
      }
    }
  }

  // Render article content
  if (bodyEl) {
    const articleDef = WIKI_ARTICLES[catId + '.' + artId];
    bodyEl.innerHTML = renderArticleContent(catId, artId, art, articleDef);
  }

  showView('view-wiki-article');
}

// ─── Render article content sections ─────────────────────────────────
function renderArticleContent(catId, artId, art, articleDef) {
  if (!articleDef) {
    return `<div class="wiki-section">
      <p>${t('wiki.art.' + catId + '.' + artId + '.description')}</p>
    </div>`;
  }

  let html = '';

  for (const section of articleDef.sections) {
    switch (section.type) {
      case 'hero-3d':
        // Already handled by viewport
        break;

      case 'info-grid':
        html += '<div class="wiki-info-grid">';
        (section.items || []).forEach(item => {
          const [key, val] = item.split(':');
          html += `<div class="wiki-info-chip">
            <span class="wiki-info-chip-label">${t('wiki.label.' + key)}</span>
            <span class="wiki-info-chip-value">${t('wiki.val.' + val)}</span>
          </div>`;
        });
        html += '</div>';
        break;

      case 'ingredients':
        if (art.ingredients) {
          html += `<div class="wiki-section">
            <h3 class="wiki-section-title">${t('wiki.ingredients')}</h3>
            <ul class="wiki-ingredients-list">
              ${art.ingredients.map(ing => `<li class="wiki-ingredient">${ing}</li>`).join('')}
            </ul>
          </div>`;
        }
        break;

      case 'steps':
        html += `<div class="wiki-section">
          <h3 class="wiki-section-title">${t('wiki.preparation')}</h3>
          <div class="wiki-steps">
            ${renderSteps(catId, artId)}
          </div>
        </div>`;
        break;

      case 'history':
        html += `<div class="wiki-section">
          <h3 class="wiki-section-title">${t('wiki.history')}</h3>
          <p class="wiki-text">${t('wiki.art.' + catId + '.' + artId + '.history')}</p>
        </div>`;
        break;

      case 'text-block':
        html += `<div class="wiki-section">
          <h3 class="wiki-section-title">${t('wiki.label.' + section.key)}</h3>
          <p class="wiki-text">${t('wiki.art.' + catId + '.' + artId + '.' + section.key)}</p>
        </div>`;
        break;

      case 'step-list':
        html += `<div class="wiki-section">
          <h3 class="wiki-section-title">${t('wiki.label.' + section.key)}</h3>
          <div class="wiki-steps">${renderSteps(catId, artId, section.key)}</div>
        </div>`;
        break;

      case 'tips':
        html += `<div class="wiki-section wiki-tips">
          <h3 class="wiki-section-title">💡 ${t('wiki.tips')}</h3>
          <p class="wiki-text">${t('wiki.art.' + catId + '.' + artId + '.' + section.key)}</p>
        </div>`;
        break;

      case 'common-errors':
        html += `<div class="wiki-section wiki-errors">
          <h3 class="wiki-section-title">⚠️ ${t('wiki.common_errors')}</h3>
          <p class="wiki-text">${t('wiki.art.' + catId + '.' + artId + '.' + section.key)}</p>
        </div>`;
        break;

      case 'timeline':
        html += renderTimeline();
        break;

      case 'glossary-list':
        html += renderGlossary(artId);
        break;

      case 'glass-gallery':
        html += `<div class="wiki-section">
          <h3 class="wiki-section-title">${t('wiki.glass_types')}</h3>
          <div class="wiki-glass-gallery">
            ${['rocks','highball','martini','flute','coupe','hurricane','margarita'].map(g =>
              `<div class="wiki-glass-card">
                <div class="wiki-glass-card-icon">🥃</div>
                <div class="wiki-glass-card-name">${t('wiki.val.' + g)}</div>
              </div>`
            ).join('')}
          </div>
        </div>`;
        break;
    }
  }

  return html;
}

// ─── Render step-by-step ─────────────────────────────────────────────
function renderSteps(catId, artId, key = 'steps') {
  const stepsText = t('wiki.art.' + catId + '.' + artId + '.' + key);
  if (!stepsText || stepsText.startsWith('wiki.')) return '';
  const steps = stepsText.split('|');
  return steps.map((step, i) =>
    `<div class="wiki-step">
      <div class="wiki-step-num">${i + 1}</div>
      <div class="wiki-step-text">${step.trim()}</div>
    </div>`
  ).join('');
}

// ─── Render timeline ─────────────────────────────────────────────────
function renderTimeline() {
  let html = '<div class="wiki-timeline">';
  TIMELINE_DATA.forEach((item, i) => {
    html += `<div class="wiki-timeline-item ${i % 2 === 0 ? 'left' : 'right'}">
      <div class="wiki-timeline-dot"></div>
      <div class="wiki-timeline-content">
        <div class="wiki-timeline-year">${item.year}</div>
        <div class="wiki-timeline-text">${t('wiki.timeline.' + item.key)}</div>
      </div>
    </div>`;
  });
  html += '</div>';
  return html;
}

// ─── Render glossary ─────────────────────────────────────────────────
function renderGlossary(artId) {
  const terms = GLOSSARY_DATA[artId] || [];
  let html = '<div class="wiki-glossary">';
  terms.forEach(term => {
    html += `<div class="wiki-glossary-item">
      <div class="wiki-glossary-term">${t('wiki.gloss.' + term)}</div>
      <div class="wiki-glossary-def">${t('wiki.gloss.' + term + '.def')}</div>
    </div>`;
  });
  html += '</div>';
  return html;
}

// ─── Open fullscreen 3D ──────────────────────────────────────────────
export function openFullscreen3D() {
  if (!currentArticle || !currentArticle.has3d) return;
  navStack.push('view-wiki-article');

  const titleEl = document.getElementById('wiki-3d-title');
  if (titleEl) titleEl.textContent = t('wiki.art.' + currentCategory.id + '.' + currentArticle.id);

  const canvas = document.getElementById('wiki-3d-canvas-full');
  if (canvas && currentArticle.scene && SCENE_BUILDERS[currentArticle.scene]) {
    mountScene(canvas, (scene, camera, ctx) => {
      SCENE_BUILDERS[currentArticle.scene](scene, camera, ctx, currentArticle.sceneParams);
    });
  }

  showView('view-wiki-3d');
}

// ─── Search ──────────────────────────────────────────────────────────
export function searchWiki(query) {
  if (!query || query.length < 2) {
    renderWikiHub();
    return;
  }
  const q = query.toLowerCase();
  const results = [];

  WIKI_CATEGORIES.forEach(cat => {
    cat.articles.forEach(art => {
      const name = t('wiki.art.' + cat.id + '.' + art.id).toLowerCase();
      if (name.includes(q) || cat.id.includes(q) || art.id.includes(q)) {
        results.push({ cat, art });
      }
    });
  });

  const list = document.getElementById('wiki-categories-grid');
  if (!list) return;

  if (results.length === 0) {
    list.innerHTML = `<div class="wiki-no-results">${t('wiki.no_results')}</div>`;
    return;
  }

  list.innerHTML = '';
  results.forEach(({ cat, art }) => {
    const card = document.createElement('div');
    card.className = 'wiki-search-result';
    card.innerHTML = `
      <div class="wiki-search-result-icon">${art.icon}</div>
      <div class="wiki-search-result-info">
        <div class="wiki-search-result-name">${t('wiki.art.' + cat.id + '.' + art.id)}</div>
        <div class="wiki-search-result-cat">${cat.icon} ${t('wiki.cat.' + cat.id)}</div>
      </div>
      ${art.has3d ? '<div class="wiki-article-3d-tag">3D</div>' : ''}
    `;
    card.addEventListener('click', () => openArticle(cat.id, art.id));
    list.appendChild(card);
  });
}

// ─── Navigation: Back ────────────────────────────────────────────────
export function wikiBack() {
  dispose();
  const prev = navStack.pop();
  if (prev === 'view-wiki-hub') {
    renderWikiHub();
  } else if (prev === 'view-wiki-category' && currentCategory) {
    openCategory(currentCategory.id);
    navStack.pop(); // Remove the extra push from openCategory
  } else if (prev === 'view-wiki-article' && currentCategory && currentArticle) {
    openArticle(currentCategory.id, currentArticle.id);
    navStack.pop();
  } else {
    showView('view-dashboard');
  }
}

// ─── 3D Controls ─────────────────────────────────────────────────────
export function wikiToggleRotate() {
  const rotating = toggleAutoRotate();
  toast(rotating ? t('wiki.autorotate_on') : t('wiki.autorotate_off'));
}

export function wikiResetCamera() {
  resetCamera();
}

export function wikiExplode() {
  // Handled per-scene via ctx.explode
  toast(t('wiki.explode_toggle'));
}

// ─── Bind all wiki events ────────────────────────────────────────────
export function bindWikiEvents() {
  const $ = id => document.getElementById(id);

  // Dashboard → Wiki
  $('btn-wiki')?.addEventListener('click', renderWikiHub);

  // Back buttons
  $('btn-back-wiki-hub')?.addEventListener('click', () => {
    dispose();
    showView('view-dashboard');
  });
  $('btn-back-wiki-category')?.addEventListener('click', wikiBack);
  $('btn-back-wiki-article')?.addEventListener('click', wikiBack);
  $('btn-back-wiki-3d')?.addEventListener('click', wikiBack);

  // Fullscreen 3D
  $('btn-wiki-fullscreen-3d')?.addEventListener('click', openFullscreen3D);

  // 3D controls
  $('btn-wiki-3d-rotate')?.addEventListener('click', wikiToggleRotate);
  $('btn-wiki-3d-reset')?.addEventListener('click', wikiResetCamera);
  $('btn-wiki-3d-explode')?.addEventListener('click', wikiExplode);

  // Search
  $('wiki-search')?.addEventListener('input', e => {
    searchWiki(e.target.value);
  });
}
