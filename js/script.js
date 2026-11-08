console.log("script.js loaded");

// Giphy API configuration
const apiKey = "ttJWcrDy1vsXzgdFAHrbaHDbnu4BoPAy";

// Select HTML elements
const gifContainer = document.querySelector("#gif-container");
const fetchButton = document.querySelector("#fetch-gif-btn");
const searchInput = document.querySelector("#search-input");

// Fetch GIFs when the button is clicked
fetchButton.addEventListener("click", async () => {
  const searchTerm = searchInput.value.trim() || "cats";

  const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchTerm)}&limit=12`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Failed to fetch GIFs");
    }

    const data = await response.json();

    // Store GIF URLs in an array
    const images = data.data.map(gif => gif.images.original.url);

    console.log(images);

    // Clear previous GIFs
    gifContainer.innerHTML = "";

    // Display GIFs
    for (const imageUrl of images) {
      gifContainer.innerHTML += `
        <img src="${imageUrl}" class="col-3 mb-3" alt="GIF">
      `;
    }
  } catch (error) {
    console.error("Error fetching GIFs:", error);
    gifContainer.textContent = "Unable to load GIFs. Please try again.";
  }
});