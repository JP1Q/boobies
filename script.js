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
 * Fetch the latest release from GitHub
 */
function fetchLatestRelease() {
  return fetch(
    'https://api.github.com/repos/SpaghettiiQ/CAST-Releases/releases/latest',
    {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
    .then(res => {
      if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}`);
      }
      return res.json();
    });
}

/**
 * Find and wire all download buttons by ID.
 * - Attaches click/download handler
 * - Replaces only the version badge text in the LAST <span>
 */
function wireDownloadButtons(release) {
  const downloadIds = ['hero-download', 'download', 'download-phone'];
  const asset = release.assets.find(a => a.name.endsWith('.dmg'));
  if (!asset) {
    console.error(`No DMG asset in release ${release.tag_name}`);
    return;
  }

  downloadIds.forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return; // not in DOM

    btn.onclick = () => window.open(asset.browser_download_url, '_blank');

    if (id === 'hero-download') {
      // target the second span (the version badge)
      const versionSpan = btn.querySelector('span:last-child');
      if (versionSpan) {
        versionSpan.textContent = release.tag_name;
      }
    }
  });
}

/**
 * Debounced resize listener to:
 * 1) Re‑wire download buttons when the DOM changes  
 * 2) Close mobile nav if switching back to desktop
 */
function setupResizeHandler(release) {
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // re‑attach download handlers
      wireDownloadButtons(release);

      // if we're above the md breakpoint, ensure mobile nav is closed
      if (window.innerWidth >= 768) {
        const mobileMenu = document.getElementById('mobile-menu');
        const navToggle  = document.getElementById('nav-toggle');
        if (mobileMenu) mobileMenu.classList.add('hidden');
        if (navToggle)  navToggle.classList.remove('open');
      }
    }, 150);
  });
}

/**
 * Update the textual release notes on the page.
 */
function updateReleaseNotes(release) {
  const notesEl = document.getElementById('release-notes');
  if (notesEl) {
    notesEl.textContent = release.body || 'No release notes available.';
  }
}

/**
 * Renders a simple changelog card into #changelog-content
 */
function renderChangelogCard(release) {
  const container = document.getElementById('changelog-content');
  if (!container) return;

  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = [
    'bg-[#21252B]/70',
    'backdrop-blur-lg',
    'p-6',
    'rounded-2xl',
    'shadow-lg',
    'space-y-4'
  ].join(' ');

  // Header: version + date
  const header = document.createElement('div');
  const title  = document.createElement('h3');
  const date   = document.createElement('span');
  title.className = 'text-2xl font-bold text-white';
  date.className  = 'text-sm text-gray-400';
  title.textContent = release.tag_name;
  date.textContent  = new Date(release.published_at).toLocaleDateString();
  header.append(title, date);

  // Notes
  const notes = document.createElement('div');
  notes.className = 'text-gray-300 whitespace-pre-wrap';
  notes.innerHTML = marked.parse(release.body || '');

  card.append(header, notes);
  container.appendChild(card);
}

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
