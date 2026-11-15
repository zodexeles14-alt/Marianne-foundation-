document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const tiles = Array.from(document.querySelectorAll('.photo-tile'));

  const lightbox = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentIndex = 0;

  // Category filter buttons
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');
      tiles.forEach((tile) => {
        const matches = category === 'all' || tile.getAttribute('data-category') === category;
        tile.classList.toggle('hidden', !matches);
      });
    });
  });

  const getVisibleTiles = () => tiles.filter((tile) => !tile.classList.contains('hidden'));

  const openLightbox = (visibleIdx) => {
    const visibleTiles = getVisibleTiles();
    if (!visibleTiles.length) return;

    currentIndex = (visibleIdx + visibleTiles.length) % visibleTiles.length;
    const tile = visibleTiles[currentIndex];
    const img = tile.querySelector('img');
    const tag = tile.querySelector('.photo-tag').textContent;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxTag.textContent = tag;
    lightboxTitle.textContent = tile.getAttribute('data-title');
    lightboxDesc.textContent = tile.getAttribute('data-desc');

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  };

  tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
      const visibleTiles = getVisibleTiles();
      const idx = visibleTiles.indexOf(tile);
      openLightbox(idx);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => openLightbox(currentIndex - 1));
  lightboxNext.addEventListener('click', () => openLightbox(currentIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
  });
});
