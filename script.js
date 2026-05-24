const words = ["Landscape", "Portrait", "Cityscape", "Lifestyle", "Architecture", "AIGC", "Vibe Coding"];
const typewriterEl = document.getElementById("typewriter");
const exploreBtn = document.getElementById("explore-btn");
const heroSection = document.getElementById("hero");
const heroRevealCanvas = document.getElementById("hero-reveal-canvas");
const portfolioSection = document.getElementById("portfolio");
const collectionSection = document.getElementById("collection");
const galleryEl = document.getElementById("gallery");
const galleryNote = document.getElementById("gallery-note");
const filterButtons = document.querySelectorAll(".filter-btn");
const navLinks = document.querySelectorAll(".nav-link");
const observedSections = document.querySelectorAll("section[id]");
const viewMoreBtn = document.getElementById("view-more-btn");
const backBtn = document.getElementById("back-btn");
const backBtnBottom = document.getElementById("back-btn-bottom");
const collectionTitle = document.getElementById("collection-title");
const collectionGallery = document.getElementById("collection-gallery");
const mediaModal = document.getElementById("media-modal");
const mediaModalImage = document.getElementById("media-modal-image");
const mediaModalVideo = document.getElementById("media-modal-video");

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let currentFilter = "landscape";

const categoryConfig = {
  landscape: { label: "Landscape", folder: "images/landscape" },
  portrait: { label: "Portrait", folder: "images/portrait" },
  cityscape: { label: "Cityscape", folder: "images/cityscape" },
  lifestyle: { label: "Lifestyle", folder: "images/lifestyle" },
  architecture: {
    label: "Architecture",
    folder: "images/architecture",
    groups: [
      { name: "建构研究", label: "建构研究", folder: "images/architecture/建构研究", mediaType: "image" },
      { name: "细部构造", label: "细部构造", folder: "images/architecture/细部构造", mediaType: "image" },
      { name: "小住宅", label: "小住宅", folder: "images/architecture/小住宅", mediaType: "image" },
      { name: "竹皮", label: "竹皮设计", folder: "images/architecture/竹皮", mediaType: "image" }
    ]
  },
  aigc: {
    label: "AIGC",
    groups: [
      { name: "car", label: "Car", folder: "images/aigc/car", mediaType: "image" },
      { name: "earphone", label: "Earphone", folder: "images/aigc/earphone", mediaType: "image" },
      { name: "Qinghai", label: "Qingahi", folder: "images/aigc/Qinghai", mediaType: "image" },
      { name: "video", label: "Video", folder: "images/aigc/video", mediaType: "video" },
      { name: "others", label: "Others", folder: "images/aigc/others", mediaType: "image" }
    ]
  },
  vibecoding: {
    label: "Vibe Coding",
    folder: "images/vibe-coding",
    groups: [
      { name: "cameradog", label: "Cameradog", folder: "images/vibe-coding/cameradog", mediaType: "image" }
    ]
  }
};
const supportedImageExtensions = ["jpg", "jpeg", "png", "webp"];
const supportedVideoExtensions = ["mp4", "webm", "mov"];

const discoveredCollectionData = {};

function toTitleCase(text) {
  return text
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function fileNameFromPath(path) {
  const fullName = path.split("/").pop() || "";
  return fullName.replace(/\.[^.]+$/, "");
}

function hasGroups(categoryKey) {
  const data = discoveredCollectionData[categoryKey];
  return data && data.groups && Array.isArray(data.groups);
}

function flattenCategoryItems(categoryKey) {
  const data = discoveredCollectionData[categoryKey];
  if (hasGroups(categoryKey)) {
    return data.groups.flatMap((g) =>
      g.items.map((item) => ({ ...item, category: categoryKey, groupName: g.name }))
    );
  }
  return (data || []).map((item) => ({ ...item, category: categoryKey }));
}

function imageExists(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

async function resolveImageByIndex(folder, index) {
  for (const ext of supportedImageExtensions) {
    const candidate = `${folder}/${index}.${ext}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await imageExists(candidate);
    if (exists) {
      return candidate;
    }
  }

  return null;
}

async function discoverCategoryImages(categoryKey, maxIndex = 300, missLimit = 30, customFolder, customLabel) {
  const config = categoryConfig[categoryKey] || {};
  const folder = customFolder || config.folder;
  const label = customLabel || config.label || "Media";
  const results = [];
  let misses = 0;

  for (let i = 1; i <= maxIndex && misses < missLimit; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const foundUrl = await resolveImageByIndex(folder, i);
    if (foundUrl) {
      results.push({
        title: `${label} ${i}`,
        src: foundUrl
      });
      misses = 0;
    } else {
      misses += 1;
    }
  }

  return results;
}

async function resolveVideoByIndex(folder, index) {
  for (const ext of supportedVideoExtensions) {
    const candidate = `${folder}/${index}.${ext}`;
    // eslint-disable-next-line no-await-in-loop
    const exists = await new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve(true);
      video.onerror = () => resolve(false);
      video.src = candidate;
    });
    if (exists) {
      return candidate;
    }
  }

  return null;
}

async function discoverVideos(folder, maxIndex = 300, missLimit = 30) {
  const results = [];
  let misses = 0;

  for (let i = 1; i <= maxIndex && misses < missLimit; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const foundUrl = await resolveVideoByIndex(folder, i);
    if (foundUrl) {
      results.push({
        title: `Video ${i}`,
        src: foundUrl,
        mediaType: "video"
      });
      misses = 0;
    } else {
      misses += 1;
    }
  }

  return results;
}

function createGalleryItemHTML(item, category, opts = {}) {
  const normalizedTitle = item.title || toTitleCase(fileNameFromPath(item.src));
  let mediaNode;
  if (item.mediaType === "video" && opts.useVideoThumbnail) {
    mediaNode = `<div class="video-thumb-placeholder" aria-label="${normalizedTitle}">
      <svg class="video-play-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none"/></svg>
    </div>`;
  } else if (item.mediaType === "video") {
    mediaNode = `<video src="${item.src}" muted loop playsinline preload="metadata"></video>`;
  } else {
    mediaNode = `<img src="${item.src}" alt="${normalizedTitle}" loading="lazy" decoding="async" />`;
  }
  return `
    <article class="gallery-item visible" data-category="${category}" data-media-type="${item.mediaType || "image"}" data-src="${item.src}" data-title="${normalizedTitle}">
      ${mediaNode}
    </article>
  `;
}

function getAllDiscoveredItems() {
  return Object.keys(categoryConfig).flatMap((cat) => flattenCategoryItems(cat));
}

function renderMainGallery() {
  const previewItems = Object.keys(categoryConfig).flatMap((cat) => {
    if (hasGroups(cat)) {
      return discoveredCollectionData[cat].groups.flatMap((g) =>
        g.items.slice(0, 4).map((item) => ({ ...item, category: cat, groupName: g.name }))
      );
    }
    return (discoveredCollectionData[cat] || []).slice(0, 4).map((item) => ({ ...item, category: cat }));
  });

  galleryEl.innerHTML = previewItems
    .map((item) => createGalleryItemHTML(item, item.category))
    .join("");

  if (previewItems.length === 0) {
    galleryNote.textContent =
      "No local media found. Add files into the category folders.";
  } else {
    galleryNote.textContent = "";
  }

  galleryEl.querySelectorAll("video").forEach((video) => {
    video.play().catch(() => {});
  });
}

function typeLoop() {
  const currentWord = words[wordIndex];
  const visibleText = currentWord.slice(0, charIndex);
  typewriterEl.textContent = visibleText;

  let delay = isDeleting ? 70 : 120;

  if (!isDeleting && charIndex < currentWord.length) {
    charIndex += 1;
  } else if (!isDeleting && charIndex === currentWord.length) {
    delay = 1200;
    isDeleting = true;
  } else if (isDeleting && charIndex > 0) {
    charIndex -= 1;
  } else {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    delay = 250;
  }

  window.setTimeout(typeLoop, delay);
}

function smoothScrollToPortfolio() {
  portfolioSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setActiveButton(activeButton) {
  filterButtons.forEach((btn) => btn.classList.remove("active"));
  activeButton.classList.add("active");
}

function showItem(item) {
  item.classList.add("visible");
  item.classList.remove("hidden");
}

function hideItem(item) {
  item.classList.add("hidden");
  window.setTimeout(() => {
    item.classList.remove("visible");
  }, 220);
}

function filterGallery(filter) {
  currentFilter = filter;
  const galleryItems = galleryEl.querySelectorAll(".gallery-item");
  galleryItems.forEach((item) => {
    const category = item.dataset.category;
    const shouldShow = category === filter;

    if (shouldShow) {
      showItem(item);
    } else if (item.classList.contains("visible")) {
      hideItem(item);
    }
  });
}

function getCollectionItemsByFilter(filter) {
  return flattenCategoryItems(filter);
}

function renderCollection(filter) {
  const config = categoryConfig[filter] || {};
  const heading = `${config.label || filter.toUpperCase()} Collection`;
  collectionTitle.textContent = heading;

  if (hasGroups(filter)) {
    const groupsHtml = discoveredCollectionData[filter].groups
      .map((g) => {
        const itemsHtml = g.items
          .map((item) => createGalleryItemHTML(item, filter, { useVideoThumbnail: true }))
          .join("");
        return `
          <div style="grid-column: 1 / -1;">
            <h3 class="section-split-title">${g.label}</h3>
          </div>
          ${itemsHtml || '<p style="grid-column: 1 / -1; color: #71717a; margin-bottom: 1.5rem;">No items found.</p>'}
        `;
      })
      .join("");

    collectionGallery.innerHTML = groupsHtml;
  } else {
    const items = flattenCategoryItems(filter);
    collectionGallery.innerHTML = items
      .map((item) => createGalleryItemHTML(item, item.category, { useVideoThumbnail: true }))
      .join("");
  }

  collectionGallery.querySelectorAll("video").forEach((video) => {
    video.play().catch(() => {});
  });

  collectionGallery.querySelectorAll(".gallery-item").forEach((item) => {
    item.dataset.revealRegistered = "1";
  });
}

function openCollectionView() {
  renderCollection(currentFilter);
  portfolioSection.classList.add("hidden");
  collectionSection.classList.remove("hidden");
  collectionSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeCollectionView() {
  collectionSection.classList.add("hidden");
  portfolioSection.classList.remove("hidden");
  portfolioSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

exploreBtn.addEventListener("click", smoothScrollToPortfolio);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    setActiveButton(button);
    filterGallery(filter);
  });
});

viewMoreBtn.addEventListener("click", openCollectionView);
backBtn.addEventListener("click", closeCollectionView);
backBtnBottom.addEventListener("click", closeCollectionView);

function updateActiveNav(targetId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${targetId}`;
    link.classList.toggle("active", isActive);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveNav(entry.target.id);
      }
    });
  },
  {
    root: null,
    rootMargin: "-35% 0px -50% 0px",
    threshold: 0.05
  }
);

observedSections.forEach((section) => sectionObserver.observe(section));

async function initializeAutoGallery() {
  const allCategoryKeys = Object.keys(categoryConfig);

  for (const cat of allCategoryKeys) {
    const config = categoryConfig[cat];
    if (config.groups && config.groups.length > 0) {
      // Category with subfolder groups
      discoveredCollectionData[cat] = { groups: [] };
      for (const group of config.groups) {
        const label = group.label || toTitleCase(group.name);
        if (group.mediaType === "video") {
          // eslint-disable-next-line no-await-in-loop
          const videos = await discoverVideos(group.folder);
          discoveredCollectionData[cat].groups.push({
            name: group.name,
            label: label,
            items: videos
          });
        } else {
          // eslint-disable-next-line no-await-in-loop
          const items = await discoverCategoryImages(
            cat, 300, 30,
            group.folder,
            label
          );
          discoveredCollectionData[cat].groups.push({
            name: group.name,
            label: label,
            items: items.map((item, idx) => ({
              ...item,
              title: `${label} ${idx + 1}`,
              mediaType: group.mediaType || "image"
            }))
          });
        }
      }
    } else if (config.folder) {
      // Category with flat folder
      // eslint-disable-next-line no-await-in-loop
      discoveredCollectionData[cat] = await discoverCategoryImages(cat);
    }
  }

  renderMainGallery();
  filterGallery("landscape");
}

function initializeHeroReveal() {
  if (!heroSection || !heroRevealCanvas) {
    return;
  }

  const ctx = heroRevealCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const revealLifetimeMs = 2000;
  const revealSpots = [];
  let rafId = null;

  function resizeCanvas() {
    const rect = heroSection.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    heroRevealCanvas.width = Math.floor(rect.width * dpr);
    heroRevealCanvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function addRevealSpot(clientX, clientY) {
    const rect = heroSection.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    revealSpots.push({
      x,
      y,
      timestamp: performance.now()
    });
  }

  function drawFrame() {
    const now = performance.now();
    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#0A0A0A";
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "destination-out";

    for (let i = revealSpots.length - 1; i >= 0; i -= 1) {
      const spot = revealSpots[i];
      const age = now - spot.timestamp;
      const progress = age / revealLifetimeMs;

      if (progress >= 1) {
        revealSpots.splice(i, 1);
        continue;
      }

      const eased = 1 - progress;
      const alpha = eased * eased;
      const radius = 120;
      const gradient = ctx.createRadialGradient(
        spot.x,
        spot.y,
        0,
        spot.x,
        spot.y,
        radius
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, ${0.62 * alpha})`);
      gradient.addColorStop(0.55, `rgba(0, 0, 0, ${0.28 * alpha})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    rafId = window.requestAnimationFrame(drawFrame);
  }

  function handlePointerMove(event) {
    addRevealSpot(event.clientX, event.clientY);
  }

  resizeCanvas();
  if (rafId) {
    window.cancelAnimationFrame(rafId);
  }
  drawFrame();

  window.addEventListener("resize", resizeCanvas);
  heroSection.addEventListener("mousemove", handlePointerMove);
}

function initializeHero3DTitle() {
  const heroEl = document.getElementById("hero");
  const titleEl = document.getElementById("hero-title");
  if (!heroEl || !titleEl) return;

  const MAX_ROT_X = 22;
  const MAX_ROT_Y = 28;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let rafId = null;

  function animate() {
    currentRotX += (targetRotX - currentRotX) * 0.12;
    currentRotY += (targetRotY - currentRotY) * 0.12;
    titleEl.style.transform = `perspective(800px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
    if (Math.abs(targetRotX - currentRotX) > 0.05 || Math.abs(targetRotY - currentRotY) > 0.05) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  function scheduleAnimate() {
    if (rafId === null) {
      rafId = requestAnimationFrame(animate);
    }
  }

  heroEl.addEventListener("mousemove", (e) => {
    const rect = heroEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    targetRotY = dx * MAX_ROT_Y;
    targetRotX = -dy * MAX_ROT_X;
    scheduleAnimate();
  });

  heroEl.addEventListener("mouseleave", () => {
    targetRotX = 0;
    targetRotY = 0;
    scheduleAnimate();
  });
}

async function initializeAbout() {
  const aboutTextEl = document.getElementById("about-text");
  const aboutPhotosEl = document.getElementById("about-photos");

  if (window.aboutContent) {
    aboutTextEl.innerHTML = window.aboutContent
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => `<p>${line}</p>`)
      .join("");
  } else {
    aboutTextEl.innerHTML = "<p class='text-zinc-400'>Edit images/about/content.js to add your bio.</p>";
  }

  const images = [];
  for (let i = 1; i <= 20; i += 1) {
    let found = false;
    for (const ext of supportedImageExtensions) {
      // eslint-disable-next-line no-await-in-loop
      const exists = await imageExists(`images/about/${i}.${ext}`);
      if (exists) {
        images.push({ src: `images/about/${i}.${ext}`, index: i });
        found = true;
        break;
      }
    }
    if (!found && i > 2 && images.length > 0) {
      break;
    }
  }

  aboutPhotosEl.innerHTML = images
    .map((img) => `<img src="${img.src}" alt="About ${img.index}" loading="lazy" />`)
    .join("");
}

function openMediaModal(src, alt, mediaType) {
  if (mediaType === "video") {
    mediaModalImage.classList.add("hidden");
    mediaModalVideo.classList.remove("hidden");
    mediaModalVideo.src = src;
    mediaModalVideo.play().catch(() => {});
  } else {
    mediaModalVideo.classList.add("hidden");
    mediaModalImage.classList.remove("hidden");
    mediaModalImage.src = src;
    mediaModalImage.alt = alt || "Full size artwork";
  }
  mediaModal.classList.remove("hidden");
  mediaModal.setAttribute("aria-hidden", "false");
}

function closeMediaModal() {
  mediaModal.classList.add("hidden");
  mediaModal.setAttribute("aria-hidden", "true");
  mediaModalImage.src = "";
  mediaModalVideo.pause();
  mediaModalVideo.src = "";
}

function bindMediaClick(container) {
  container.addEventListener("click", (event) => {
    const item = event.target.closest(".gallery-item");
    if (!item) {
      return;
    }

    const mediaType = item.dataset.mediaType || "image";
    openMediaModal(item.dataset.src, item.dataset.title, mediaType);
  });
}

bindMediaClick(galleryEl);
bindMediaClick(collectionGallery);
mediaModal.addEventListener("click", closeMediaModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mediaModal.classList.contains("hidden")) {
    closeMediaModal();
  }
});

typeLoop();
initializeAutoGallery();
initializeHeroReveal();
initializeHero3DTitle();
initializeAbout();
initializeScrollReveal();
initializeSectionCards();

function initializeSectionCards() {
  const cards = document.querySelectorAll(".section-card");
  if (!cards.length || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio < 0.25) {
          entry.target.classList.add("fading-out");
          entry.target.classList.remove("fading-in");
        } else {
          entry.target.classList.remove("fading-out");
          entry.target.classList.add("fading-in");
        }
      });
    },
    { threshold: [0, 0.15, 0.3, 0.5, 0.75] }
  );

  cards.forEach((card) => {
    card.classList.add("fading-in");
    observer.observe(card);
  });
}

function initializeScrollReveal() {
  if (typeof IntersectionObserver === "undefined") {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".gallery-item.scroll-hidden").forEach((el) => el.classList.remove("scroll-hidden"));
    return;
  }

  document.body.classList.add("js-reveal-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
  );

  function observeReveals() {
    document.querySelectorAll(".reveal:not(.is-visible):not([data-reveal-observed])").forEach((el) => {
      el.dataset.revealObserved = "1";
      observer.observe(el);
    });
  }

  observeReveals();

  const itemObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((e) => e.isIntersecting);
      visibleEntries.forEach((entry, idx) => {
        setTimeout(() => entry.target.classList.remove("scroll-hidden"), idx * 60);
        itemObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
  );

  function registerGalleryItems() {
    document.querySelectorAll(".gallery-item:not([data-reveal-registered])").forEach((item) => {
      item.dataset.revealRegistered = "1";
      item.classList.add("scroll-hidden");
      itemObserver.observe(item);
    });
  }

  registerGalleryItems();

  const mo = new MutationObserver(() => {
    registerGalleryItems();
    observeReveals();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Safety net: reveal everything after 4s in case observer didn't fire
  setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add("is-visible");
      }
    });
    document.querySelectorAll(".gallery-item.scroll-hidden").forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        item.classList.remove("scroll-hidden");
      }
    });
  }, 800);
}

const resumeIcons = {
  education: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 4 2 10l10 6 10-6z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/></svg>',
  skills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  awards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88"/></svg>',
  contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
};

function parseResume(content) {
  const sections = [];
  const blocks = content.split(/\n##\s+/).map((b) => b.trim()).filter(Boolean);
  blocks.forEach((block) => {
    const lines = block.split("\n");
    const headerLine = lines.shift().replace(/^##\s+/, "");
    const headerParts = headerLine.split("|").map((s) => s.trim());
    const title = headerParts[0];
    let icon = "default";
    headerParts.slice(1).forEach((part) => {
      const m = part.match(/^icon\s*=\s*(\S+)/i);
      if (m) icon = m[1].toLowerCase();
    });
    sections.push({ title, icon, body: lines.join("\n").trim() });
  });
  return sections;
}

function renderResumeBody(md) {
  const lines = md.split("\n");
  const out = [];
  let inList = false;
  let paragraphBuf = [];

  const flushParagraph = () => {
    if (paragraphBuf.length) {
      out.push("<p>" + formatInline(paragraphBuf.join(" ")) + "</p>");
      paragraphBuf = [];
    }
  };

  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push("<li>" + formatInline(trimmed.replace(/^[-*]\s+/, "")) + "</li>");
    } else if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      out.push("<p><strong>" + formatInline(trimmed.replace(/^###\s+/, "")) + "</strong></p>");
    } else {
      flushList();
      paragraphBuf.push(trimmed);
    }
  }
  flushParagraph();
  flushList();
  return out.join("");
}

function formatInline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderResumeCards() {
  const container = document.getElementById("resume-cards");
  if (!container || !window.resumeContent) return;

  const sections = parseResume(window.resumeContent);
  container.innerHTML = sections
    .map((sec, idx) => {
      const iconSvg = resumeIcons[sec.icon] || resumeIcons.default;
      const bodyHtml = renderResumeBody(sec.body);
      return `
        <div class="flip-card" tabindex="0" role="button" aria-label="${sec.title} card. Click to flip.">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="flip-card-icon">${iconSvg}</div>
              <div class="flip-card-title">${sec.title}</div>
            </div>
            <div class="flip-card-back">
              <div class="flip-card-back-header">
                <span class="flip-card-back-icon">${iconSvg}</span>
                <span class="flip-card-back-title">${sec.title}</span>
              </div>
              <div class="flip-card-content">${bodyHtml}</div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll(".flip-card").forEach((card) => {
    const toggle = (e) => {
      if (e.target.tagName === "A") return;
      card.classList.toggle("flipped");
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });
}

function initializeResume() {
  renderResumeCards();
  window.refreshResume = renderResumeCards;
}

initializeResume();
