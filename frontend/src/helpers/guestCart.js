// helpers/guestCart.js
const CART_KEY = "guestCart";

// Get all items from guest cart
export const getGuestCart = () => {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
};

// Add an item to guest cart
export const addToGuestCart = (listingId) => {
  const cart = getGuestCart();
  // Avoid duplicates
  if (!cart.some(item => item.listingId === listingId)) {
    cart.push({ listingId });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
};

// Remove a single item from guest cart
export const removeFromGuestCart = (listingId) => {
  const updated = getGuestCart().filter(item => item.listingId !== listingId);
  localStorage.setItem(CART_KEY, JSON.stringify(updated));
  return updated;
};

// Clear entire guest cart
export const clearGuestCart = () => {
  localStorage.removeItem(CART_KEY);
};
