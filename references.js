/**
 * Polymont — references gallery + lightbox
 * Shared component used on the homepage and the halové vestavby page.
 * Reads an optional `data-default-filter` attribute on .refs to preselect a category.
 */

(function () {
  const section = document.querySelector('.refs');
  const grid    = document.getElementById('refs-grid');
  const pager   = document.getElementById('refs-pager');
  if (!section || !grid || !pager) return;

  let REFS = [];
  const PER_PAGE = 8;
  let refsFilter = section.dataset.defaultFilter || 'all';
  let refsPage = 1;

  function filteredRefs() {
    return refsFilter === 'all' ? REFS : REFS.filter(r => r.cat === refsFilter);
  }

  function renderRefs() {
    const items = filteredRefs();
    const total = items.length;
    const pages = Math.ceil(total / PER_PAGE);
    if (refsPage > pages) refsPage = 1;

    const slice = items.slice((refsPage - 1) * PER_PAGE, refsPage * PER_PAGE);

    grid.innerHTML = slice.map(r => {
      const label = r.cat === 'vestavby' ? 'Vestavby' : 'Vrata a dveře';
      const alt   = r.alt || label;
      return `<div class="refs__item" data-category="${r.cat}">
        <div class="refs__img-wrap">
          <img src="${r.src}" alt="${alt}" loading="lazy"
               onerror="this.closest('.refs__img-wrap').classList.add('refs__img-wrap--placeholder');this.style.display='none'" />
        </div>
      </div>`;
    }).join('');

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
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Preselect the active filter chip to match the default filter
  section.querySelectorAll('.refs__chip').forEach(chip => {
    chip.classList.toggle('refs__chip--active', chip.dataset.filter === refsFilter);
  });

  fetch('/references.json')
    .then(r => r.json())
    .then(data => {
      REFS = Array.isArray(data) ? data : (data.items || []);
      renderRefs();
    })
    .catch(() => {
      console.warn('Could not load references.json — gallery empty.');
      renderRefs();
    });

  section.querySelectorAll('.refs__chip').forEach(chip => {
    chip.addEventListener('click', () => {
      refsFilter = chip.dataset.filter;
      refsPage   = 1;

      section.querySelectorAll('.refs__chip').forEach(c => c.classList.remove('refs__chip--active'));
      chip.classList.add('refs__chip--active');

      renderRefs();
    });
  });

  // ── Lightbox ──────────────────────────────────────────────────────────────
  const lb        = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  const lbCounter = document.getElementById('lb-counter');
  let lbIndex = 0;

  if (lb && lbImg && lbClose && lbPrev && lbNext && lbCounter) {
    const lbOpen = (index) => {
      const items = filteredRefs();
      lbIndex = Math.max(0, Math.min(index, items.length - 1));
      lbShow();
      lb.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    function lbShow() {
      const items = filteredRefs();
      const ref   = items[lbIndex];
      lbImg.style.animation = 'none';
      // eslint-disable-next-line no-unused-expressions
      lbImg.offsetWidth;
      lbImg.style.animation = '';
      lbImg.src = ref.src;
      lbImg.alt = ref.cat === 'vestavby' ? 'Vestavby' : 'Vrata a dveře';
      lbCounter.textContent = `${lbIndex + 1} / ${items.length}`;
      lbPrev.disabled = lbIndex === 0;
      lbNext.disabled = lbIndex === items.length - 1;
    }

    const lbCloseFn = () => {
      lb.setAttribute('hidden', '');
      document.body.style.overflow = '';
    };

    lbClose.addEventListener('click', lbCloseFn);
    lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; lbShow(); } });
    lbNext.addEventListener('click', () => { if (lbIndex < filteredRefs().length - 1) { lbIndex++; lbShow(); } });

    lb.addEventListener('click', e => { if (e.target === lb) lbCloseFn(); });

    document.addEventListener('keydown', e => {
      if (lb.hasAttribute('hidden')) return;
      if (e.key === 'Escape')      lbCloseFn();
      if (e.key === 'ArrowLeft'  && lbIndex > 0)                          { lbIndex--; lbShow(); }
      if (e.key === 'ArrowRight' && lbIndex < filteredRefs().length - 1)  { lbIndex++; lbShow(); }
    });

    grid.addEventListener('click', e => {
      const wrap = e.target.closest('.refs__img-wrap');
      if (!wrap) return;
      const item  = wrap.closest('.refs__item');
      const items = Array.from(grid.querySelectorAll('.refs__item'));
      const posInPage = items.indexOf(item);
      const globalIndex = (refsPage - 1) * PER_PAGE + posInPage;
      lbOpen(globalIndex);
    });
  }
})();
