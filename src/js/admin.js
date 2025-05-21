import {
    fetchCategories,
    API_BASE,
    fetchProducts,
    createProductCard,
} from "../main.js";

export function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById("product-category");
    if (!categoryDropdown) return;

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
                stock: Number.parseInt(
                    document.getElementById("product-stock").value
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

async function renderAdminProducts() {
    const productContainer = document.getElementById("view-admin-products");
    if (!productContainer) return;

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

// Function that creates small product cards for all products on the admin page

function createAdminProductCard(product) {
    const card = document.createElement("div");
    card.className = "admin-product-card";

    const img = document.createElement("img");
    img.src = product.image1;
    img.alt = product.name;

    const name = document.createElement("h4");
    name.textContent = product.name;

    const brand = document.createElement("p");
    brand.textContent = `Brand: ${product.brand}`;

    const price = document.createElement("p");
    price.textContent = `Price: ${product.price} kr`;

    const stock = document.createElement("p");
    stock.textContent = `Stock: ${product.stock}`;

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(brand);
    card.appendChild(price);
    card.appendChild(stock);

    return card;
}

// Function that renders all products on the admin page
async function renderAllProductsByDepartment() {
    const productContainer = document.getElementById("edit-products");
    if (!productContainer) return;

    try {
        const products = await fetchProducts();
        const departments = [...new Set(products.map((p) => p.department))];

        // Show all products by department
        departments.forEach((department) => {
            const departmentProducts = products.filter(
                (product) => product.department === department
            );

            const departmentSection = document.createElement("div");
            departmentSection.className = "department-section";

            const departmentTitle = document.createElement("h3");
            departmentTitle.textContent = department;
            departmentSection.appendChild(departmentTitle);

            departmentProducts.forEach((product) => {
                const card = createAdminProductCard(product);
                departmentSection.appendChild(card);
            });

            productContainer.appendChild(departmentSection);
        });
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

renderAllProductsByDepartment();
