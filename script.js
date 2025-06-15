document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS animations, mobile nav, and the typewriter
  AOS.init({ once: true });
  setupMobileNav();
  startTypewriter();

  // Fetch GitHub release data once
  fetchLatestRelease()
    .then(release => {
      renderChangelogCard(release);
      // Wire up download buttons initially
      wireDownloadButtons(release);
      // Re‑wire on resize to catch dynamically added elements AND close mobile nav
      setupResizeHandler(release);
      // Update the release notes text
      updateReleaseNotes(release);
    })
    .catch(err => {
      console.error('Failed to fetch release data:', err);
    });
});

/**
 * Fetch and parse Appcast XML from Sparkle
 */
async function fetchAppcast() {
  const res = await fetch('https://www.cast-for-mac.com/appcast.xml');
  if (!res.ok) throw new Error(`Appcast returned ${res.status}`);
  const xmlText = await res.text();
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, 'application/xml');
}

/**
 * Extracts the latest release <item> from the XML
 */
function parseLatestItem(xmlDoc) {
  const item = xmlDoc.querySelector('channel > item');
  if (!item) throw new Error('No <item> in feed');

  const get = tag => item.querySelector(tag)?.textContent?.trim() || '';
  const getAttr = (selector, attr) => item.querySelector(selector)?.getAttribute(attr) || '';
  const getNsAttr = (selector, attr, ns) =>
    item.querySelector(selector)?.getAttributeNS(ns, attr) || '';

  return {
    tag_name: get('sparkle\\:version') || get('title'),
    published_at: get('pubDate'),
    notes_html: item.querySelector('description')?.textContent || '',
    release_notes_url: get('sparkle\\:releaseNotesLink'), // may not exist in your XML
    download_url: getAttr('enclosure', 'url'),
  };
}

/**
 * Wire download buttons
 */
function wireDownloadButtons(release) {
  const downloadIds = ['hero-download', 'download', 'download-phone'];
  downloadIds.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.onclick = () => window.open(release.download_url, '_blank');

    if (id === 'hero-download') {
      const versionSpan = btn.querySelector('span:last-child');
      if (versionSpan) versionSpan.textContent = release.tag_name;
    }
  });
}

/**
 * Setup debounced resize listener
 */
function setupResizeHandler(release) {
  let timeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      wireDownloadButtons(release);
      if (window.innerWidth >= 768) {
        document.getElementById('mobile-menu')?.classList.add('hidden');
        document.getElementById('nav-toggle')?.classList.remove('open');
      }
    }, 150);
  });
}

/**
 * Update release notes from inline HTML or external link
 */
function updateReleaseNotes(release) {
  const el = document.getElementById('release-notes');
  if (!el) return;
  if (release.release_notes_url) {
    fetch(release.release_notes_url)
      .then(res => res.text())
      .then(html => {
        el.innerHTML = html;
      })
      .catch(() => {
        el.textContent = 'Failed to load external release notes.';
      });
  } else {
    el.innerHTML = release.notes_html || 'No release notes available.';
  }
}

/**
 * Render changelog card
 */
function renderChangelogCard(release) {
  const container = document.getElementById('changelog-content');
  if (!container) return;

  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'bg-[#21252B]/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg space-y-4';

  const header = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'text-2xl font-bold text-white';
  title.textContent = release.tag_name;

  const date = document.createElement('span');
  date.className = 'text-sm text-gray-400';
  date.textContent = new Date(release.published_at).toLocaleDateString();

  header.append(title, date);

  const notes = document.createElement('div');
  notes.className = 'text-gray-300 whitespace-pre-wrap';
  notes.innerHTML = release.notes_html || 'No changelog provided.';

  card.append(header, notes);
  container.appendChild(card);
}

/**
 * Main logic
 */
(async function init() {
  try {
    const xml = await fetchAppcast();
    const latest = parseLatestItem(xml);

    wireDownloadButtons(latest);
    updateReleaseNotes(latest);
    renderChangelogCard(latest);
    setupResizeHandler(latest);
  } catch (err) {
    console.error('Error fetching appcast:', err);
  }
})();


/**
 * Mobile Navigation Toggle
 */
function setupMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!navToggle || !mobileMenu) return;

  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    navToggle.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      navToggle.classList.remove('open');
    });
  });
}

/**
 * Typewriter Effect for Hero Section
 */
function startTypewriter() {
  const typewriter = document.getElementById('typewriter');
  if (!typewriter) return;

  const words = ['CAST', 'Organize', 'Switch', 'Customize'];
  let wordIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const current = words[wordIndex];
    typewriter.textContent = isDeleting
      ? current.substring(0, charIndex--)
      : current.substring(0, charIndex++);

    if (!isDeleting && charIndex - 1 === current.length) {
      isDeleting = true;
      setTimeout(type, 1000);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(type, 30);
    } else {
      setTimeout(type, isDeleting ? 80 : 90);
    }
  }

  type();
}
