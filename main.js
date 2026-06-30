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

// ── References gallery + lightbox — see references.js ─────────────────────────

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
