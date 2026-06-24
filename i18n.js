/**
 * Polymont i18n — lightweight translation module
 *
 * Translations are bundled inline so the page works when opened
 * directly from the filesystem (file://) without a server.
 *
 * Usage in HTML:
 *   <span data-i18n="some.key"></span>
 *   <img data-i18n-alt="some.key" />
 *   <div data-i18n-aria-label="some.key"></div>
 *
 * Usage in JS:
 *   import { setLang, t } from './i18n.js';
 *   await setLang('de');
 *   t('hero.left.title');
 */

const SUPPORTED   = ['cs', 'de', 'en'];
const DEFAULT     = 'cs';
const STORAGE_KEY = 'polymont_lang';

// ── Bundled translations (no fetch needed) ────────────────────────────────
const TRANSLATIONS = {
  cs: {
    "lang": "cs",
    "dir": "ltr",
    "nav.menu": "Menu",
    "nav.logo_alt": "Polymont",
    "hero.left.title": "Halové vestavby",
    "hero.left.subtitle": "příčky a prosklené hliníkové konstrukce",
    "hero.left.img_alt": "Halové vestavby, příčky a prosklené hliníkové konstrukce",
    "hero.right.title": "Vrata a dveře",
    "hero.right.subtitle": "průmyslová, garážová, domovní",
    "hero.right.img_alt": "Průmyslová a garážová vrata, domovní a průmyslové dveře",
    "hero.label.consulting": "PORADENSTVÍ",
    "hero.label.management": "MANAGEMENT",
    "hero.label.control": "ŘÍZENÍ"
  },
  de: {
    "lang": "de",
    "dir": "ltr",
    "nav.menu": "Menü",
    "nav.logo_alt": "Polymont",
    "hero.left.title": "Halleneinbauten",
    "hero.left.subtitle": "Trennwände und verglaste Aluminiumkonstruktionen",
    "hero.left.img_alt": "Halleneinbauten, Trennwände und verglaste Aluminiumkonstruktionen",
    "hero.right.title": "Tore und Türen",
    "hero.right.subtitle": "Industrie-, Garagen- und Haustüren",
    "hero.right.img_alt": "Industrie- und Garagentore, Haus- und Industrietüren",
    "hero.label.consulting": "BERATUNG",
    "hero.label.management": "MANAGEMENT",
    "hero.label.control": "STEUERUNG"
  },
  en: {
    "lang": "en",
    "dir": "ltr",
    "nav.menu": "Menu",
    "nav.logo_alt": "Polymont",
    "hero.left.title": "Mezzanine Floors",
    "hero.left.subtitle": "partitions and glazed aluminium structures",
    "hero.left.img_alt": "Mezzanine floors, partitions and glazed aluminium structures",
    "hero.right.title": "Doors & Gates",
    "hero.right.subtitle": "industrial, garage, residential",
    "hero.right.img_alt": "Industrial and garage doors, residential and industrial doors",
    "hero.label.consulting": "CONSULTING",
    "hero.label.management": "MANAGEMENT",
    "hero.label.control": "CONTROL"
  }
};

let _translations = {};
let _current = DEFAULT;

/** Resolve which language to use (priority: explicit → stored → default) */
function resolveLang(requested) {
  if (requested && SUPPORTED.includes(requested)) return requested;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  return DEFAULT; // Czech — always fall back to Czech
}

/** Replace \n with <br> for HTML rendering */
function toHTML(str) {
  return str.replace(/\n/g, '<br>');
}

/** Apply loaded translations to all data-i18n-* elements in the DOM */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = _translations[key];
    if (val !== undefined) el.innerHTML = toHTML(val);
  });

  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    const val = _translations[key];
    if (val !== undefined) el.setAttribute('alt', val);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    const val = _translations[key];
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  document.documentElement.setAttribute('lang', _translations.lang || _current);
  document.documentElement.setAttribute('dir', _translations.dir || 'ltr');
}

/**
 * Set the active language and re-render the page.
 * @param {string} [lang] - 'cs' | 'de' | 'en' (omit to auto-detect)
 */
export async function setLang(lang) {
  _current = resolveLang(lang);
  _translations = TRANSLATIONS[_current];
  localStorage.setItem(STORAGE_KEY, _current);
  applyTranslations();
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: _current } }));
}

/** Get the currently active language code */
export function getLang() {
  return _current;
}

/** Translate a single key (after setLang has been called) */
export function t(key) {
  return _translations[key] ?? key;
}

/** All supported language codes */
export { SUPPORTED };
