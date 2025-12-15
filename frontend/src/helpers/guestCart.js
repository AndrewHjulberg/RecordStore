const CART_KEY = "guestCart";

export const getGuestCart = () => {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
};

export const addToGuestCart = (listingId) => {
  const cart = getGuestCart();
  const item = cart.find(i => i.listingId === listingId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ listingId, quantity: 1 });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearGuestCart = () => {
  localStorage.removeItem(CART_KEY);
};
