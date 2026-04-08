/**
 * SoftBeatz — player, search, theme, and UI interactions
 */

const SOUND_BASE = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-";

/** @type {{ title: string; artist: string; cover: string; audioIndex: number }[]} */
const TRACKS = [
  { title: "Sense", artist: "Mark Band", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", audioIndex: 1 },
  { title: "Feel The Beats", artist: "Aurora Diane", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80", audioIndex: 2 },
  { title: "Echoes", artist: "Vega Nightly", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80", audioIndex: 3 },
  { title: "Hip Hop Mix", artist: "Curated playlist", cover: "https://images.unsplash.com/photo-1571266028243-e473f6abe6b0?w=200&q=80", audioIndex: 4 },
  { title: "Soul Sessions", artist: "Curated playlist", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80", audioIndex: 5 },
  { title: "Summer Hits", artist: "Curated playlist", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80", audioIndex: 6 },
  { title: "R&B Night", artist: "Curated playlist", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80", audioIndex: 7 },
  { title: "Yimmi Yimmi", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&q=80", audioIndex: 8 },
  { title: "Tere Liye", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&q=80", audioIndex: 9 },
  { title: "Zihaal E Miskin", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80", audioIndex: 10 },
  { title: "Ve Kamleya", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&q=80", audioIndex: 11 },
  { title: "Koi Tumsa Nahi", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&q=80", audioIndex: 12 },
  { title: "Aaguner", artist: "Shreya Ghoshal", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&q=80", audioIndex: 13 },
];

const LIBRARY_INDICES = [7, 8, 9, 10, 11, 12];
const LIBRARY_DURATIONS = ["2:56", "3:49", "4:02", "3:54", "3:56", "3:33"];

const audioEl = document.getElementById("audio-el");
const btnPlay = document.getElementById("btn-play");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const progressTrack = document.getElementById("progress-track");
const progressFill = document.getElementById("progress-fill");
const progressThumb = document.getElementById("progress-thumb");
const playerTitle = document.getElementById("player-title");
const playerArtist = document.getElementById("player-artist");
const playerCover = document.getElementById("player-cover");
const playerCurrent = document.getElementById("player-current");
const playerDuration = document.getElementById("player-duration");
const playerLike = document.getElementById("player-like");
const searchInput = document.getElementById("search-input");
const toastEl = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const btnMenu = document.getElementById("btn-menu");
const btnTheme = document.getElementById("btn-theme");
const newsletterForm = document.getElementById("newsletter-form");

let currentIndex = 0;
let isScrubbing = false;
let rafId = 0;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function audioUrlForTrack(track) {
  const n = ((track.audioIndex - 1) % 16) + 1;
  return `${SOUND_BASE}${n}.mp3`;
}

function loadTrack(index) {
  const track = TRACKS[index];
  if (!track) return;
  currentIndex = index;
  audioEl.src = audioUrlForTrack(track);
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  playerCover.src = track.cover;
  playerCover.alt = `${track.title} by ${track.artist}`;
  updatePlayButton(false);
  audioEl.load();
}

function updatePlayButton(playing) {
  btnPlay.classList.toggle("is-playing", playing);
  btnPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function togglePlay() {
  if (!audioEl.src) loadTrack(0);
  if (audioEl.paused) {
    audioEl.play().catch(() => showToast("Unable to play audio — check your connection."));
  } else {
    audioEl.pause();
  }
}

function playIndex(index) {
  if (index === currentIndex && audioEl.src) {
    togglePlay();
    return;
  }
  loadTrack(index);
  audioEl.play().catch(() => showToast("Unable to play audio — check your connection."));
}

function syncProgress() {
  if (!audioEl.duration || isScrubbing) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  progressFill.style.width = `${pct}%`;
  progressThumb.style.left = `${pct}%`;
  playerCurrent.textContent = formatTime(audioEl.currentTime);
  progressTrack.setAttribute("aria-valuenow", String(Math.round(pct)));
}

function loop() {
  syncProgress();
  rafId = requestAnimationFrame(loop);
}

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-visible");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("is-visible"), 3200);
}

/* Build library list (Figma copy) */
function buildSongList() {
  const ul = document.getElementById("song-list");
  if (!ul) return;
  ul.innerHTML = "";
  LIBRARY_INDICES.forEach((trackIdx, i) => {
    const t = TRACKS[trackIdx];
    const li = document.createElement("li");
    li.className = "song-row";
    li.dataset.search = `${t.title} ${t.artist}`.toLowerCase();
    li.innerHTML = `
      <div class="song-row__main">
        <img class="song-row__thumb" src="${t.cover}" alt="" width="56" height="56" loading="lazy" />
        <div class="song-row__meta">
          <p class="song-row__title">${t.title}</p>
          <p class="song-row__artist">${t.artist}</p>
        </div>
      </div>
      <div class="song-row__side">
        <span class="song-row__time">${LIBRARY_DURATIONS[i]}</span>
        <button type="button" class="song-row__play" data-play-index="${trackIdx}" aria-label="Play ${t.title}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    `;
    ul.appendChild(li);
  });
}

/* Delegated play buttons */
document.body.addEventListener("click", (e) => {
  const playBtn = e.target.closest("[data-play-index]");
  if (!playBtn) return;
  const idx = parseInt(playBtn.getAttribute("data-play-index"), 10);
  if (!Number.isNaN(idx)) playIndex(idx);
});

btnPlay.addEventListener("click", () => togglePlay());
btnPrev.addEventListener("click", () => {
  const next = (currentIndex - 1 + TRACKS.length) % TRACKS.length;
  playIndex(next);
});
btnNext.addEventListener("click", () => {
  const next = (currentIndex + 1) % TRACKS.length;
  playIndex(next);
});

audioEl.addEventListener("play", () => {
  updatePlayButton(true);
  if (!rafId) rafId = requestAnimationFrame(loop);
});
audioEl.addEventListener("pause", () => {
  updatePlayButton(false);
  cancelAnimationFrame(rafId);
  rafId = 0;
});
audioEl.addEventListener("loadedmetadata", () => {
  playerDuration.textContent = formatTime(audioEl.duration);
});
audioEl.addEventListener("ended", () => {
  playIndex((currentIndex + 1) % TRACKS.length);
});

/* Progress interaction */
function setProgressFromClientX(clientX) {
  const rect = progressTrack.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  if (audioEl.duration) {
    audioEl.currentTime = ratio * audioEl.duration;
    syncProgress();
  }
}

progressTrack.addEventListener("click", (e) => {
  if (e.target === progressThumb) return;
  setProgressFromClientX(e.clientX);
});

progressTrack.addEventListener("keydown", (e) => {
  const step = 5;
  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
    e.preventDefault();
    audioEl.currentTime = Math.min(audioEl.duration || 0, audioEl.currentTime + step);
    syncProgress();
  }
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
    e.preventDefault();
    audioEl.currentTime = Math.max(0, audioEl.currentTime - step);
    syncProgress();
  }
});

let pointerId = null;
progressTrack.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  pointerId = e.pointerId;
  isScrubbing = true;
  progressTrack.setPointerCapture(pointerId);
  setProgressFromClientX(e.clientX);
});
progressTrack.addEventListener("pointermove", (e) => {
  if (!isScrubbing || e.pointerId !== pointerId) return;
  setProgressFromClientX(e.clientX);
});
progressTrack.addEventListener("pointerup", (e) => {
  if (e.pointerId !== pointerId) return;
  isScrubbing = false;
  pointerId = null;
  try {
    progressTrack.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
});

/* Search filter */
function normalizeSearchables() {
  document.querySelectorAll("[data-search]").forEach((el) => {
    if (!el.dataset.searchNorm) {
      el.dataset.searchNorm = el.dataset.search.toLowerCase();
    }
  });
}

function runSearch(query) {
  const q = query.trim().toLowerCase();
  const items = document.querySelectorAll(".song-row, .track-card, .playlist-card, .artist-card");
  items.forEach((el) => {
    const hay = el.dataset.searchNorm || el.dataset.search?.toLowerCase() || "";
    const match = !q || hay.includes(q);
    el.classList.toggle("is-hidden", !match);
  });
}

searchInput.addEventListener("input", () => runSearch(searchInput.value));

/* Theme */
const THEME_KEY = "softbeatz-theme";
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  btnTheme.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  localStorage.setItem(THEME_KEY, theme);
}

btnTheme.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(next);
});

const saved = localStorage.getItem(THEME_KEY);
if (saved === "light" || saved === "dark") {
  applyTheme(saved);
}

/* Mobile sidebar */
function setSidebar(open) {
  sidebar.classList.toggle("is-open", open);
  sidebarOverlay.hidden = !open;
  sidebarOverlay.classList.toggle("is-visible", open);
  btnMenu.setAttribute("aria-expanded", open ? "true" : "false");
  btnMenu.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

btnMenu.addEventListener("click", () => setSidebar(!sidebar.classList.contains("is-open")));
sidebarOverlay.addEventListener("click", () => setSidebar(false));

document.querySelectorAll(".sidebar__link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 1023px)").matches) setSidebar(false);
  });
});

/* Keyboard: space = play/pause */
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
  e.preventDefault();
  togglePlay();
});

/* Like toggle */
playerLike.addEventListener("click", () => {
  const pressed = playerLike.getAttribute("aria-pressed") === "true";
  playerLike.setAttribute("aria-pressed", pressed ? "false" : "true");
  playerLike.textContent = pressed ? "♡" : "♥";
});

/* Newsletter */
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("Thanks — you’re on the list.");
  newsletterForm.reset();
});

/* Scroll reveal */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) en.target.classList.add("is-visible");
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
);
revealEls.forEach((el) => io.observe(el));

/* Section spy for sidebar + top nav */
function getActiveSectionId() {
  const y = window.innerHeight * 0.28;
  const ids = ["section-home", "section-spotlight", "section-playlists", "section-favorites", "newsletter"];
  let active = ids[0];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= y) active = id;
  }
  return active;
}

function updateActiveNav() {
  const active = getActiveSectionId();
  document.querySelectorAll(".sidebar__link").forEach((a) => {
    const href = a.getAttribute("href")?.replace("#", "");
    let on = false;
    if (href === "section-home") on = active === "section-home";
    if (href === "section-library") on = active === "section-spotlight";
    if (href === "section-favorites") on = active === "section-favorites";
    a.classList.toggle("sidebar__link--active", on);
  });
  const topMap = {
    "#section-home": ["section-home"],
    "#section-spotlight": ["section-spotlight"],
    "#section-playlists": ["section-playlists"],
    "#newsletter": ["newsletter"],
  };
  document.querySelectorAll(".top-header__link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const match = topMap[href];
    a.classList.toggle("top-header__link--active", match ? match.includes(active) : false);
  });
}

let scrollT;
window.addEventListener(
  "scroll",
  () => {
    clearTimeout(scrollT);
    scrollT = setTimeout(updateActiveNav, 60);
  },
  { passive: true }
);

/* Init */
buildSongList();
normalizeSearchables();
loadTrack(0);
updateActiveNav();
playerDuration.textContent = "0:00";
audioEl.pause();
