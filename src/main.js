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
        <img src="${product.image2}"/>
    </div>
    <p>${product.description}</p>
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
