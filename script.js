// Initialize AOS animations
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({ once: true });
    
    // Set up mobile navigation toggle
    setupMobileNav();
    
    // Start typewriter effect
    startTypewriter();
  });



  
  fetch("https://api.github.com/repos/KotatsuApp/Kotatsu/releases/latest")
  .then(res => res.json())
  .then(data => {
    // Check if assets exist before attempting to access them
    if (data.assets && data.assets.length > 0) {
      const apkAsset = data.assets.find(asset => asset.name.endsWith(".apk"));
      const downloadBtn = document.getElementById("hero-download");

      if (apkAsset && downloadBtn) {
        downloadBtn.onclick = () => window.open(apkAsset.browser_download_url, '_blank');
        downloadBtn.querySelector("span:last-child").textContent = data.tag_name;
        downloadBtn.querySelector("span:first-child").textContent = "Download for Android";
      }

      // Update release notes if needed
      const releaseNotes = data.body || "No release notes available.";
      const notesElement = document.getElementById("release-notes");
      if (notesElement) {
        notesElement.textContent = releaseNotes;
      }
    } else {
      console.error("No APK assets found in the latest release.");
    }
  })
  .catch(error => {
    console.error("Failed to fetch release data:", error);
  });

  fetch("https://api.github.com/repos/KotatsuApp/Kotatsu/releases/latest")
  .then(res => res.json())
  .then(release => {
    const container = document.getElementById("changelog-content");
    container.innerHTML = ""; // clear out any old content

    // create a little card for the latest release
    const card = document.createElement("div");
    card.classList.add(
      "bg-[#21252B]/70",
      "backdrop-blur-lg",
      "p-6",
      "rounded-2xl",
      "shadow-lg",
      "space-y-4"
    );

    // version header + date
    const header = document.createElement("div");
    const title = document.createElement("h3");
    title.classList.add("text-2xl", "font-bold", "text-white");
    title.textContent = `${release.tag_name}`;
    const date = document.createElement("span");
    date.classList.add("text-sm", "text-gray-400");
    date.textContent = new Date(release.published_at).toLocaleDateString();
    header.append(title, date);

    // markdown → HTML (using marked.js)
    const notes = document.createElement("div");
    notes.classList.add("text-gray-300", "whitespace-pre-wrap");
    notes.innerHTML = marked.parse(release.body || "");

    // assemble and inject
    card.append(header, notes);
    container.appendChild(card);
  })
  .catch(err => console.error("Couldn’t load latest changelog:", err));



  /**
   * Mobile Navigation Toggle
   * Handles the opening/closing of the mobile menu
   */
  function setupMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      navToggle.classList.toggle('open');
    });
    
    // Close mobile menu when clicking on menu items
    const mobileMenuItems = mobileMenu.querySelectorAll('a');
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        navToggle.classList.remove('open');
      });
    });
  }
  
  /**
   * Typewriter Effect for Hero Section
   * Animates through a series of words with typing and deleting effects
   */
  function startTypewriter() {
    const typewriter = document.getElementById('typewriter');
    const words = ["CAST", "Organize", "Switch", "Dominate"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
      const current = words[wordIndex];
      
      if (isDeleting) {
        typewriter.textContent = current.substring(0, charIndex--);
      } else {
        typewriter.textContent = current.substring(0, charIndex++);
      }
  
      // Handle timing for different stages
      if (!isDeleting && charIndex - 1 === current.length) {
        // Word fully typed - pause before deleting
        isDeleting = true;
        setTimeout(type, 1000);
      } else if (isDeleting && charIndex === 0) {
        // Word fully deleted - move to next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 30);
      } else {
        // Regular typing/deleting speed
        setTimeout(type, isDeleting ? 80 : 90);
      }
    }
    
    // Start the typewriter effect
    type();
  }


