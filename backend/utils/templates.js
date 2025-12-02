export function orderConfirmationTemplate(order) {
  return `
    <h2>Thank you for your order!</h2>

    <p>Your order <strong>#${order.id}</strong> has been received.</p>

    <h3>Items:</h3>
    <ul>
      ${order.items
        .map(
          (item) =>
            `<li>${item.title} — $${item.price} (${item.quantity})</li>`
        )
        .join("")}
    </ul>

    <p>Total: <strong>$${order.total}</strong></p>

    <p>We will notify you when your order ships.</p>

    <br>
    <p>– Your Record Store 🎵</p>
  `;
}
