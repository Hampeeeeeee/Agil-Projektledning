import {
    fetchCategories,
    API_BASE,
    fetchProducts,
    createProductCard,
} from "../main.js";

export function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById("product-category");
    if (!categoryDropdown) return; // Exit if element doesn't exist

    fetchCategories()
        .then((categories) => {
            categories.forEach((category) => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryDropdown.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error fetching categories:", error);
        });
}

// Function to post product from admin page to backend
async function postProduct(product) {
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(product),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        alert("Product added successfully!");
        document.getElementById("admin-form").reset();
        // Refresh the category dropdown after adding a product with potentially a new category
        populateCategoryDropdown();
    } catch (error) {
        console.error("Error adding product:", error);
        alert("Error adding product: " + error.message);
    }
}

// Initialize admin functionality only if we're on the admin page
document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("admin-form");

    if (productForm) {
        // We're on the admin page, initialize admin functionality
        populateCategoryDropdown();
        renderAdminProducts();

        productForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // Get values from both category fields
            const selectedCategory =
                document.getElementById("product-category").value;
            const newCategory = document
                .getElementById("new-product-category")
                .value.trim();

            // Determine which category to use (new one takes precedence if provided)
            const finalCategory = newCategory ? newCategory : selectedCategory;

            // Validate that a category is selected or entered
            if (!finalCategory) {
                alert("Please select an existing category or enter a new one");
                return;
            }

            const product = {
                name: document.getElementById("product-name").value,
                brand: document.getElementById("product-brand").value,
                category: finalCategory,
                department: document.getElementById("product-department").value,
                price: Number.parseFloat(
                    document.getElementById("product-price").value
                ),
                image1: document.getElementById("product-image1").value,
                image2: document.getElementById("product-image2").value || "",
                image3: document.getElementById("product-image3").value || "",
            };

            postProduct(product);
            productForm.reset();
        });

        // Add event listeners for the category fields
        const categoryDropdown = document.getElementById("product-category");
        const newCategoryInput = document.getElementById(
            "new-product-category"
        );

        categoryDropdown.addEventListener("change", function () {
            if (this.value) {
                newCategoryInput.value = "";
            }
        });

        newCategoryInput.addEventListener("input", function () {
            if (this.value.trim()) {
                categoryDropdown.value = "";
            }
        });

        // Add event listener for view products button if it exists
        const viewProductsBtn = document.getElementById("view-products-btn");
        if (viewProductsBtn) {
            viewProductsBtn.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }
    }
});

// Render products added to the backend after 2025-05-19

async function renderAdminProducts() {
    const productContainer = document.getElementById("view-admin-products");
    if (!productContainer) return; // Exit if container doesn't exist

    try {
        const products = await fetchProducts();
        const filteredProducts = products.filter((product) => {
            const timestamp = new Date(product.timestamp);
            return timestamp >= new Date("2025-05-18");
        });

        filteredProducts.forEach((product) => {
            const card = createProductCard(product);
            productContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}
