import { fetchProducts, createProductCard } from "../main.js";

export async function searchProduct() {
    const searchInput = document.getElementById("search-input");
    const searchQuery = searchInput.value.trim().toLowerCase();
    const productContainer = document.getElementById("product-container");

    if (!searchQuery) {
        productContainer.innerHTML =
            '<p class="no-products">Please enter a search term.</p>';
        return;
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const departmentFilter = urlParams.get("department");

        const currentPage = window.location.pathname.split("/").pop();
        let pageDepartment = null;

        if (currentPage === "men.html") {
            pageDepartment = "Men";
        } else if (currentPage === "women.html") {
            pageDepartment = "Women";
        } else if (currentPage === "unisex.html") {
            pageDepartment = "Unisex";
        }

        const finalDepartmentFilter = departmentFilter || pageDepartment;

        const products = await fetchProducts();
        let filteredProducts = products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery)
        );

        if (finalDepartmentFilter) {
            filteredProducts = filteredProducts.filter(
                (product) => product.department === finalDepartmentFilter
            );
        }

        productContainer.innerHTML = "";

        if (filteredProducts.length === 0) {
            productContainer.innerHTML =
                '<p class="no-products">No products found matching your search.</p>';
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
}

export function setupSearch() {
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            searchProduct();
        });
    }
}
