import { isWishlisted, toggleWishlist } from "./storage.js";

function refreshWishlistButtons() {
  document.querySelectorAll("[data-wishlist-toggle]").forEach((button) => {
    const slug = button.getAttribute("data-wishlist-toggle");
    const active = slug ? isWishlisted(slug) : false;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? "Saved" : "Save";
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-wishlist-toggle]");
  if (!target) {
    return;
  }

  const slug = target.getAttribute("data-wishlist-toggle");
  if (!slug) {
    return;
  }

  toggleWishlist(slug);
  refreshWishlistButtons();
});

refreshWishlistButtons();
window.addEventListener("bodynation:wishlist-updated", refreshWishlistButtons);
