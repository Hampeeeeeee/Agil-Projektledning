const API_BASE = "http://localhost:3000";

async function fetchProducts() {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
    <h2>${product.name}</h2>
    <div class="product-images">
        <img src="${product.image1}"/>
    </div>
    <p>Department: ${product.department}</p>
    <p>Brand: ${product.brand}</p>
    <p>${product.category}</p>
    <p>Price: $${product.price}</p>
`;
    return card;
}

async function displayProducts() {
    const productContainer = document.getElementById("product-container");
    try {
        const products = await fetchProducts();
        products.forEach((product) => {
            const card = createProductCard(product);
            productContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

displayProducts();
const sliderImage = document.querySelector('.sliderimg');
const sliderImages = document.querySelectorAll('.sliderimg img');

// Buttons
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');

// Counter
let counter = 1;
const size = sliderImages[0].clientWidth;

sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';

// Button Listeners
nextBtn.addEventListener('click', () => {
  if (counter >= sliderImages.length - 1) return;

  sliderImage.style.transition = 'transform 0.4s ease-in-out';
  counter++;
  sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';
});

prevBtn.addEventListener('click', () => {
  if (counter <= 0) return;

  sliderImage.style.transition = 'transform 0.4s ease-in-out';
  counter--;
  sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';
});

sliderImage.addEventListener('transitionend', () => {
  if (sliderImages[counter].id === 'lastclone') {
    sliderImage.style.transition = 'none';
    counter = sliderImages.length - 2;
    sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';
  }

  if (sliderImages[counter].id === 'first-clone') {
    sliderImage.style.transition = 'none';
    counter = 1;
    sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';
  }
});

// Auto-slide every 3 seconds
let autoSlide = setInterval(() => {
  if (counter >= sliderImages.length - 1) return;

  sliderImage.style.transition = 'transform 0.4s ease-in-out';
  counter++;
  sliderImage.style.transform = 'translateX(' + (-size * counter) + 'px)';
}, 3000);
