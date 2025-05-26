export const API_BASE = "http://localhost:3000";
import { showProductPopup } from "./js/product-popup.js";
import { setupSearch } from "./js/search.js";

export async function fetchProducts() {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function fetchCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) {
        console.error(
            "Failed to fetch categories:",
            response.status,
            response.statusText
        );
        throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
}

export function createProductCard(product) {
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
    <p>Stock: ${product.stock} st</p>
    <p>Price: ${product.price} kr</p>
    <p class="wishlist-text">
  <span class="wishlist-label">Add to wishlist:</span>
  <button class="add-to-wishlist-btn" title="Wishlist">
  <i class="wishlist-icon">♥</i>
  </button>
  </p>
`;
    const wishlistBtn = card.querySelector(".add-to-wishlist-btn");
    const icon = card.querySelector(".wishlist-icon");
    const label = card.querySelector(".wishlist-label");

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const isInWishlist = wishlist.some((p) => p.id === product.id);
    if (isInWishlist) {
        icon.classList.add("filled-heart");
        label.textContent = "Added to wishlist";
    }

    wishlistBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const isFilled = icon.classList.toggle("filled-heart");
        label.textContent = isFilled ? "Added to wishlist" : "Add to wishlist:";

        wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

        const productExists = wishlist.some((p) => p.id === product.id);

        if (isFilled && !productExists) {
            wishlist.push(product);
        } else {
            wishlist = wishlist.filter((p) => p.id !== product.id);
        }

        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    });

    card.addEventListener("click", () => {
        showProductPopup(product);
    });

    return card;
}

export async function displayProducts() {
    const productContainer = document.getElementById("product-container");
    if (!productContainer) return;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFilter = urlParams.get("category");
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
        let filteredProducts = products;

        if (finalDepartmentFilter) {
            filteredProducts = filteredProducts.filter(
                (product) => product.department === finalDepartmentFilter
            );
        }

        if (categoryFilter) {
            filteredProducts = filteredProducts.filter(
                (product) => product.category === categoryFilter
            );

            const pageTitle = document.querySelector("h1");
            if (pageTitle) {
                const department = finalDepartmentFilter || "All";
                pageTitle.textContent = `${department}'s ${categoryFilter}`;
            }
        }

        productContainer.innerHTML = "";

        if (filteredProducts.length === 0) {
            productContainer.innerHTML =
                '<p class="no-products">No products found in this category.</p>';
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

export async function fetchHighlights() {
    const response = await fetch(`${API_BASE}/highlights`);
    if (!response.ok) {
        throw new Error("Failed to fetch highlights");
    }
    return response.json();
}

export function displayHighlights() {
    const container = document.getElementById("highlights-container");
    if (!container) return;
    fetchHighlights()
        .then((products) => {
            container.innerHTML = "";
            products.forEach((product) => {
                const card = createProductCard(product);
                container.appendChild(card);
            });
        })
        .catch((error) => {
            console.error("Error loading highlights:", error);
            container.innerHTML = "<p>Misslyckades ladda highlights.</p>";
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./css/product-popup.css";
    document.head.appendChild(link);

    displayProducts();
    setupSearch();

    const path = window.location.pathname.split("/").pop();
    if (path === "" || path === "index.html" || path === "/") {
        displayHighlights();
    }

    const adminForm = document.getElementById("admin-login-form");
    if (adminForm) {
        adminForm.addEventListener("submit", (event) => {
            event.preventDefault();
            window.location.href = "admin.html";
        });
        adminForm.reset();
    }

    const isAdminPage = window.location.pathname.includes("admin.html");
    if (isAdminPage) {
        import("./js/admin.js")
            .then((adminModule) => {})
            .catch((err) => {
                console.error("Failed to load admin module:", err);
            });
    }
});
