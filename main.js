/**
 * Polymont — main script
 * Self-contained: no imports, no fetch, works on file:// and servers alike.
 */

// ── Translations (bundled inline) ────────────────────────────────────────────
const TRANSLATIONS = {
  cs: {
    lang: 'cs', dir: 'ltr',
    'nav.menu': 'Menu',
    'nav.logo_alt': 'Polymont',
    'hero.left.title': 'Halové vestavby',
    'hero.left.subtitle': 'PŘÍČKY A PROSKLENÉ HLINÍKOVÉ KONSTRUKCE',
    'hero.left.img_alt': 'Halové vestavby, příčky a prosklené hliníkové konstrukce',
    'hero.right.title': 'Vrata a dveře',
    'hero.right.subtitle': 'PRO OBYTNÉ I KOMERČNÍ OBJEKTY',
    'hero.right.img_alt': 'Průmyslová a garážová vrata, domovní a průmyslové dveře',
    'hero.left.btn': 'Více o vestavbách a konstrukcích',
    'hero.left.btn_new': 'Novinka',
    'hero.left.btn_configurator': 'Konfigurátor vestaveb',
    'hero.right.btn': 'Více o vratech a dveřích',
    'footer.intro': 'Sídlo máme v Kutné Hoře. Pro osobní schůzku v naší vzorkovně doporučujeme zavolat předem.',
    'footer.cta': 'Kontaktujte nás',
    'footer.map_open': 'Otevřít v mapách →',
    'footer.privacy': 'Ochrana osobních údajů',
    'refs.eyebrow': 'Reference',
    'refs.title': 'Realizované projekty',
    'refs.filter_all': 'Vše',
    'refs.filter_vestavby': 'Vestavby',
    'refs.filter_vrata': 'Vrata a dveře',
    'clients.label': 'Vybraní zákazníci',
    'about.eyebrow': 'O nás',
    'about.heading_l1': 'Realizujeme',
    'about.heading_l2': 'vaše představy',
    'about.heading_l3': 'od roku 1995',
    'about.col1': 'Od plastových oken k výrobě vlastních hliníkových konstrukcí. Rodinná firma s třicetiletou tradicí a zázemím vlastní výrobní haly otevřené na konci roku 2025.',
    'about.col2': 'Klademe si za cíl poskytnout vstřícné technické poradenství podložené zkušenostmi, pečlivou montáž a zejména kdykoli dostupný záruční i pozáruční servis.',
    'about.btn': 'Náš příběh',
    'hero.label.consulting': 'Rodina',
    'hero.label.management': '30 let',
    'hero.label.control': 'HÖRMANN'
  },
  de: {
    lang: 'de', dir: 'ltr',
    'nav.menu': 'Menü',
    'nav.logo_alt': 'Polymont',
    'hero.left.title': 'Halleneinbauten',
    'hero.left.subtitle': 'Trennwände und verglaste Aluminiumkonstruktionen',
    'hero.left.img_alt': 'Halleneinbauten, Trennwände und verglaste Aluminiumkonstruktionen',
    'hero.right.title': 'Tore und Türen',
    'hero.right.subtitle': 'Industrie-, Garagen- und Haustüren',
    'hero.right.img_alt': 'Industrie- und Garagentore, Haus- und Industrietüren',
    'hero.left.btn': 'Mehr zu Einbauten',
    'hero.right.btn': 'Mehr zu Toren',
    'hero.label.consulting': 'BERATUNG',
    'hero.label.management': 'MANAGEMENT',
    'hero.label.control': 'STEUERUNG'
  },
  en: {
    lang: 'en', dir: 'ltr',
    'nav.menu': 'Menu',
    'nav.logo_alt': 'Polymont',
    'hero.left.title': 'Mezzanine Floors',
    'hero.left.subtitle': 'partitions and glazed aluminium structures',
    'hero.left.img_alt': 'Mezzanine floors, partitions and glazed aluminium structures',
    'hero.right.title': 'Doors & Gates',
    'hero.right.subtitle': 'industrial, garage, residential',
    'hero.right.img_alt': 'Industrial and garage doors, residential and industrial doors',
    'hero.left.btn': 'Explore mezzanines',
    'hero.right.btn': 'Explore doors',
    'hero.label.consulting': 'CONSULTING',
    'hero.label.management': 'MANAGEMENT',
    'hero.label.control': 'CONTROL'
  }
};

const SUPPORTED   = ['cs', 'de', 'en'];
const DEFAULT     = 'cs';
const STORAGE_KEY = 'polymont_lang';

// ── i18n ─────────────────────────────────────────────────────────────────────
function resolveLang(requested) {
  if (requested && SUPPORTED.includes(requested)) return requested;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  return DEFAULT;
}

function applyLang(lang) {
  const dict = TRANSLATIONS[lang];
  if (!dict) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n')];
    if (val !== undefined) el.innerHTML = val.replace(/\n/g, '<br>');
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-alt')];
    if (val !== undefined) el.setAttribute('alt', val);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const val = dict[el.getAttribute('data-i18n-aria-label')];
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  document.documentElement.setAttribute('lang', dict.lang || lang);
  document.documentElement.setAttribute('dir', dict.dir || 'ltr');
  localStorage.setItem(STORAGE_KEY, lang);
}

// Boot with stored or default language
applyLang(resolveLang());

// ── Enable hover zoom after load animation completes ─────────────────────────
document.querySelectorAll('.hero__panel').forEach(panel => {
  const img = panel.querySelector('img');
  img.addEventListener('animationend', () => {
    panel.classList.add('anim-done');
  }, { once: true });
});

// ── Footer year ──────────────────────────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── References — loaded from _data/references.json (managed via Decap CMS) ───
let REFS = [];

const PER_PAGE = 8;
let refsFilter = 'all';
let refsPage   = 1;

function filteredRefs() {
  return refsFilter === 'all' ? REFS : REFS.filter(r => r.cat === refsFilter);
}

function renderRefs() {
  const grid  = document.getElementById('refs-grid');
  const pager = document.getElementById('refs-pager');
  if (!grid || !pager) return;

  const items = filteredRefs();
  const total = items.length;
  const pages = Math.ceil(total / PER_PAGE);
  if (refsPage > pages) refsPage = 1;

  const slice = items.slice((refsPage - 1) * PER_PAGE, refsPage * PER_PAGE);

  // Grid
  grid.innerHTML = slice.map(r => {
    const label = r.cat === 'vestavby' ? 'Vestavby' : 'Vrata a dveře';
    const alt   = r.alt || label;
    return `<div class="refs__item" data-category="${r.cat}">
      <div class="refs__img-wrap">
        <img src="${r.src}" alt="${alt}" loading="lazy"
             onerror="this.closest('.refs__img-wrap').classList.add('refs__img-wrap--placeholder');this.style.display='none'" />
      </div>
      <p class="refs__item-label">${label}</p>
    </div>`;
  }).join('');

  // Pager
  if (pages <= 1) { pager.innerHTML = ''; return; }

  let html = `<button class="refs__page-btn refs__page-btn--arrow" data-page="${refsPage - 1}" ${refsPage === 1 ? 'disabled' : ''} aria-label="Předchozí">&#8592;</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="refs__page-btn${i === refsPage ? ' refs__page-btn--active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += `<button class="refs__page-btn refs__page-btn--arrow" data-page="${refsPage + 1}" ${refsPage === pages ? 'disabled' : ''} aria-label="Další">&#8594;</button>`;
  pager.innerHTML = html;

  pager.querySelectorAll('.refs__page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      refsPage = parseInt(btn.dataset.page, 10);
      renderRefs();
      document.querySelector('.refs').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Fetch references from CMS data file, fall back gracefully
if (document.getElementById('refs-grid')) {
  fetch('_data/references.json')
    .then(r => r.json())
    .then(data => {
      // Decap CMS wraps list collections in { items: [...] }
      REFS = Array.isArray(data) ? data : (data.items || []);
      renderRefs();
    })
    .catch(() => {
      console.warn('Could not load _data/references.json — gallery empty.');
      renderRefs();
    });
}

// ── References filter ────────────────────────────────────────────────────────
document.querySelectorAll('.refs__chip').forEach(chip => {
  chip.addEventListener('click', () => {
    refsFilter = chip.dataset.filter;
    refsPage   = 1;

    document.querySelectorAll('.refs__chip').forEach(c => c.classList.remove('refs__chip--active'));
    chip.classList.add('refs__chip--active');

    renderRefs();
  });
});

// ── Lightbox ──────────────────────────────────────────────────────────────────
const lb       = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.getElementById('lb-close');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');
const lbCounter= document.getElementById('lb-counter');
let lbIndex    = 0;          // index within filteredRefs()

function lbOpen(index) {
  const items = filteredRefs();
  lbIndex = Math.max(0, Math.min(index, items.length - 1));
  lbShow();
  lb.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function lbShow() {
  const items = filteredRefs();
  const ref   = items[lbIndex];
  // Trigger re-animation by cloning the img node
  lbImg.style.animation = 'none';
  // eslint-disable-next-line no-unused-expressions
  lbImg.offsetWidth;          // reflow
  lbImg.style.animation = '';
  lbImg.src = ref.src;
  lbImg.alt = ref.cat === 'vestavby' ? 'Vestavby' : 'Vrata a dveře';
  lbCounter.textContent = `${lbIndex + 1} / ${items.length}`;
  lbPrev.disabled = lbIndex === 0;
  lbNext.disabled = lbIndex === items.length - 1;
}

function lbClose_fn() {
  lb.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

lbClose.addEventListener('click', lbClose_fn);
lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; lbShow(); } });
lbNext.addEventListener('click', () => { if (lbIndex < filteredRefs().length - 1) { lbIndex++; lbShow(); } });

// Click backdrop (outside stage) to close
lb.addEventListener('click', e => {
  if (e.target === lb) lbClose_fn();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (lb.hasAttribute('hidden')) return;
  if (e.key === 'Escape')      lbClose_fn();
  if (e.key === 'ArrowLeft'  && lbIndex > 0)                          { lbIndex--; lbShow(); }
  if (e.key === 'ArrowRight' && lbIndex < filteredRefs().length - 1)  { lbIndex++; lbShow(); }
});

// Wire up grid clicks — delegated on #refs-grid so it survives re-renders
document.getElementById('refs-grid').addEventListener('click', e => {
  const wrap = e.target.closest('.refs__img-wrap');
  if (!wrap) return;
  const item  = wrap.closest('.refs__item');
  const grid  = document.getElementById('refs-grid');
  const items = Array.from(grid.querySelectorAll('.refs__item'));
  const posInPage = items.indexOf(item);                       // 0-7 within current page
  const globalIndex = (refsPage - 1) * PER_PAGE + posInPage;  // position within filtered list
  lbOpen(globalIndex);
});

// ── Hamburger toggle ──────────────────────────────────────────────────────────
const menuBtn = document.querySelector('.nav__menu');
const lines   = document.querySelectorAll('.nav__hamburger span');
let menuOpen  = false;

menuBtn.addEventListener('click', () => {
  menuOpen = !menuOpen;
  lines[0].style.transform = menuOpen ? 'translateY(7px) rotate(45deg)' : '';
  lines[1].style.opacity   = menuOpen ? '0' : '';
  lines[2].style.transform = menuOpen ? 'translateY(-7px) rotate(-45deg)' : '';
});
