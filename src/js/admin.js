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

async function editProduct(productId, updatedProduct) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedProduct),
        });

        if (!response.ok) {
            throw new Error("Failed to update product");
        }

        const data = await response.json();
        alert("Product updated successfully!");
        return data;
    } catch (error) {
        console.error("Error updating product:", error);
        alert("Error updating product: " + error.message);
    }
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

    card.onclick = () => showAdminEditProductPopup(product);

    return card;
}

async function renderAllProductsByDepartment() {
    const productContainer = document.getElementById("edit-products");
    if (!productContainer) return;

    try {
        const products = await fetchProducts();
        const departments = [...new Set(products.map((p) => p.department))];

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

function showAdminEditProductPopup(product) {
    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "product-popup-overlay";

    // Popup
    const popup = document.createElement("div");
    popup.className = "product-popup";

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "popup-close";
    closeBtn.innerHTML = "×";
    closeBtn.onclick = () => {
        overlay.classList.remove("active");
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    // Form
    const form = document.createElement("form");
    form.className = "popup-content admin-edit-form";
    form.innerHTML = `
        <div class="form-row"><label>Name:<input type="text" name="name" value="${
            product.name
        }" required></label></div>
        <div class="form-row"><label>Brand:<input type="text" name="brand" value="${
            product.brand
        }" required></label></div>
        <div class="form-row"><label>Category:<input type="text" name="category" value="${
            product.category
        }" required></label></div>
        <div class="form-row"><label>Department:<input type="text" name="department" value="${
            product.department
        }" required></label></div>
        <div class="form-row"><label>Price:<input type="number" name="price" value="${
            product.price
        }" required></label></div>
        <div class="form-row"><label>Stock:<input type="number" name="stock" value="${
            product.stock
        }" required></label></div>
        <div class="form-row"><label>Image 1:<input type="url" name="image1" value="${
            product.image1
        }" required></label></div>
        <div class="form-row"><label>Image 2:<input type="url" name="image2" value="${
            product.image2 || ""
        }"></label></div>
        <div class="form-row"><label>Image 3:<input type="url" name="image3" value="${
            product.image3 || ""
        }"></label></div>
        <div class="form-row"><button type="submit">Save</button></div>
    `;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const updatedProduct = Object.fromEntries(new FormData(form).entries());
        updatedProduct.price = parseFloat(updatedProduct.price);
        updatedProduct.stock = parseInt(updatedProduct.stock);
        await editProduct(product.id, updatedProduct);
        overlay.classList.remove("active");
        setTimeout(() => document.body.removeChild(overlay), 300);
        // Optionally refresh product list here
    };

    popup.appendChild(closeBtn);
    popup.appendChild(form);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    void overlay.offsetWidth;
    overlay.classList.add("active");
}

renderAllProductsByDepartment();
