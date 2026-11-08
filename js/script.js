
// ==========================================
// GIFVERSE 2.0
// Giphy API + Search + Trending + Favorites
// ==========================================

// 1. GIPHY API CONFIGURATION

const API_KEY = "ttJWcrDy1vsXzgdFAHrbaHDbnu4BoPAy";

const API_BASE = "https://api.giphy.com/v1/gifs";

// 2. SELECT HTML ELEMENTS

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const fetchButton = document.querySelector("#fetch-gif-btn");
const surpriseButton = document.querySelector("#surprise-btn");

const gifContainer = document.querySelector("#gif-container");
const favoritesContainer = document.querySelector("#favorites-container");

const statusMessage = document.querySelector("#status-message");
const resultsTitle = document.querySelector("#results-title");
const emptyFavorites = document.querySelector("#empty-favorites");

// 3. APP DATA

let currentGifs = [];
let favorites = loadFavorites();

const moodButtons = document.querySelector(".mood-buttons");

// 4. LOAD FAVORITES FROM LOCAL STORAGE

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("gifverse-favorites")) || [];
  } catch (error) {
    console.error("Could not load favorites:", error);
    return [];
  }
}

// Save favorites in the browser
function saveFavorites() {
  localStorage.setItem("gifverse-favorites", JSON.stringify(favorites));
}

// 5. UPDATE STATUS MESSAGE

function showStatus(message) {
  statusMessage.textContent = message;
}

// 6. CONVERT GIPHY DATA INTO OUR GIF FORMAT

function formatGif(gif) {
  const images = gif.images || {};

  return {
    id: gif.id,
    title: gif.title || "Untitled GIF",
    url: images.original?.url || "",
    preview:
      images.fixed_width?.url ||
      images.original?.url ||
      ""
  };
}

// 7. CREATE GIF CARDS

function renderGifs(gifs, container) {
  container.replaceChildren();

  gifs.forEach((gif) => {
    const card = document.createElement("article");
    card.className = "gif-card";

    const image = document.createElement("img");
    image.src = gif.preview;
    image.alt = gif.title;
    image.loading = "lazy";

    const actions = document.createElement("div");
    actions.className = "gif-actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "🔗 Copy link";
    copyButton.dataset.action = "copy";
    copyButton.dataset.id = gif.id;

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";

    const isFavorite = favorites.some(
      (item) => item.id === gif.id
    );

    favoriteButton.textContent = isFavorite ? "❤️ Saved" : "🤍 Save";

    favoriteButton.className = isFavorite
      ? "favorite-btn is-favorite"
      : "favorite-btn";

    favoriteButton.dataset.action = "favorite";
    favoriteButton.dataset.id = gif.id;

    actions.append(copyButton, favoriteButton);
    card.append(image, actions);

    container.appendChild(card);
  });
}

// 8. DISPLAY FAVORITES

function renderFavorites() {
  renderGifs(favorites, favoritesContainer);

  emptyFavorites.style.display =
    favorites.length === 0 ? "block" : "none";
}

// 9. FETCH TRENDING GIFS

async function loadTrending() {
  resultsTitle.textContent = "🔥 Trending GIFs";
  showStatus("Finding the internet's current obsession...");

  try {
    const endpoint =
      `${API_BASE}/trending?api_key=${API_KEY}&limit=12&rating=pg`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Unable to load trending GIFs.");
    }

    const data = await response.json();

    currentGifs = data.data.map(formatGif);

    renderGifs(currentGifs, gifContainer);

    showStatus("The internet has spoken. Here are the trending GIFs! 🔥");

  } catch (error) {
    console.error("Trending error:", error);
    showStatus("Oops! Couldn't load trending GIFs. Try again.");
  }
}

// 10. SEARCH GIFS BY KEYWORD

async function searchGifs(searchTerm) {
  if (!searchTerm.trim()) {
    showStatus("Enter something to search for first! 💜");
    return;
  }

  resultsTitle.textContent = `🔎 Results for "${searchTerm}"`;

  showStatus("Searching for your perfect GIF...");

  fetchButton.disabled = true;

  try {
    const endpoint =
      `${API_BASE}/search?api_key=${API_KEY}` +
      `&q=${encodeURIComponent(searchTerm)}` +
      `&limit=12&rating=pg`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Search request failed.");
    }

    const data = await response.json();

    currentGifs = data.data.map(formatGif);

    renderGifs(currentGifs, gifContainer);

    if (currentGifs.length === 0) {
      showStatus("No GIFs found. Try another search! 😭");
    } else {
      showStatus(`Found ${currentGifs.length} GIFs. Choose your favorite! 💜`);
    }

  } catch (error) {
    console.error("Search error:", error);
    showStatus("Something went wrong. Please try again.");
  } finally {
    fetchButton.disabled = false;
  }
}

// 11. SEARCH BUTTON AND ENTER KEY

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  searchGifs(searchInput.value.trim());
});

// 12. FUNNY MOOD BUTTONS

moodButtons.addEventListener("click", (event) => {
  const button = event.target.closest(".mood-btn");

  if (!button) return;

  const mood = button.dataset.search;

  searchInput.value = mood;

  searchGifs(mood);
});

// 13. SURPRISE ME - RANDOM GIF

async function surpriseMe() {
  resultsTitle.textContent = "🎲 Surprise GIF";
  showStatus("Preparing something unexpected...");

  surpriseButton.disabled = true;

  try {
    const endpoint =
      `${API_BASE}/random?api_key=${API_KEY}&rating=pg`;

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Could not get a random GIF.");
    }

    const data = await response.json();

    const randomGif = formatGif(data.data);

    currentGifs = [randomGif];

    renderGifs(currentGifs, gifContainer);

    showStatus("You never know what you're going to get. 😂");

  } catch (error) {
    console.error("Random GIF error:", error);
    showStatus("Surprise failed! Try again.");
  } finally {
    surpriseButton.disabled = false;
  }
}

surpriseButton.addEventListener("click", surpriseMe);

// 14. ADD OR REMOVE FAVORITES

function toggleFavorite(gifId) {
  const existingIndex = favorites.findIndex(
    (gif) => gif.id === gifId
  );

  if (existingIndex !== -1) {
    favorites.splice(existingIndex, 1);
    showStatus("GIF removed from your favorites. 💔");

  } else {
    const gif = currentGifs.find(
      (item) => item.id === gifId
    );

    if (!gif) return;

    favorites.push(gif);
    showStatus("Saved! Your collection just got better. 💜");
  }

  saveFavorites();

  renderGifs(currentGifs, gifContainer);
  renderFavorites();
}

// 15. COPY GIF LINK

async function copyGifLink(gifId, button) {
  const gif =
    currentGifs.find((item) => item.id === gifId) ||
    favorites.find((item) => item.id === gifId);

  if (!gif) return;

  try {
    await navigator.clipboard.writeText(gif.url);

    button.textContent = "✓ Copied!";

    showStatus("GIF link copied! Go share the chaos. 😂");

    setTimeout(() => {
      button.textContent = "🔗 Copy link";
    }, 1500);

  } catch (error) {
    console.error("Copy error:", error);
    showStatus("Couldn't copy the link. Check browser permissions.");
  }
}

// 16. HANDLE GIF CARD BUTTONS

function handleGifActions(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const gifId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "favorite") {
    toggleFavorite(gifId);
  }

  if (action === "copy") {
    copyGifLink(gifId, button);
  }
}

gifContainer.addEventListener("click", handleGifActions);

favoritesContainer.addEventListener("click", handleGifActions);

// 17. START GIFVERSE

renderFavorites();
loadTrending();

console.log("GIFVERSE 2.0 is ready! 💜");
