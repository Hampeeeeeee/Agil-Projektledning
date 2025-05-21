document.addEventListener("DOMContentLoaded", () => {
  const wishlistContainer = document.getElementById('wishlist-container');
  
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  if (wishlist.length === 0) {
    wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  wishlist.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <h2>${product.name}</h2>
      <div class="product-images">
        <img src="${product.image1}" />
      </div>
      <p>Department: ${product.department}</p>
      <p>Brand: ${product.brand}</p>
      <p>${product.category}</p>
      <p>Stock: ${product.stock} st</p>
      <p>Price: ${product.price} kr</p>
    `;
    wishlistContainer.appendChild(card);
  });
});