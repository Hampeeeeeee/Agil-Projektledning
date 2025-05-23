import { fetchProducts } from "../main";
import { createProductCard } from "./productCard";

export async function searchProduct(){
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const productContainer = document.getElementById("product-container");
    
    if (!searchInput || !searchButton || !productContainer) return;
    
    searchButton.addEventListener("click", async () => {
        const query = searchInput.value.toLowerCase();
        productContainer.innerHTML = "";
    
        try {
        const products = await fetchProducts();
        const filteredProducts = products.filter((product) =>
            product.name.toLowerCase().includes(query)
        );
    
        if (filteredProducts.length === 0) {
            productContainer.innerHTML =
            '<p class="no-products">No products found.</p>';
            return;
        }
    
        filteredProducts.forEach((product) => {
            const card = createProductCard(product);
            productContainer.appendChild(card);
        });
        } catch (error) {
        console.error("Error fetching products:", error);
        productContainer.innerHTML =
            '<p class="error">Failed to load products. Please try again later.</p>';
        }
    });
}
// 