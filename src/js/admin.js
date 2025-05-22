import {
    fetchCategories,
    API_BASE,
    fetchProducts,
    createProductCard,
} from "../main.js";

console.log("✅ admin.js loaded");

// Populate existing categories into dropdown
export function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById("product-category");
    if (!categoryDropdown) return;

    fetchCategories()
        .then(categories => {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryDropdown.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching categories:", error));
}

async function editProduct(productId, updatedProduct) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProduct),
        });
        if (!response.ok) throw new Error("Failed to update product");
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error("Network response was not ok");
        await response.json();
        alert("Product added successfully!");
        document.getElementById("admin-form").reset();
        populateCategoryDropdown();
    } catch (error) {
        console.error("Error adding product:", error);
        alert("Error adding product: " + error.message);
    }
}

async function fetchHighlights() {
    const res = await fetch(`${API_BASE}/highlights`);
    if (!res.ok) throw new Error("Failed to fetch highlights");
    const products = await res.json();
    return products.map(p => p.id);
}

function renderHighlightsSelection() {
    console.log("↗️ renderHighlightsSelection körs");
    const container = document.getElementById("highlights-list");
    if (!container) return;
    container.innerHTML = "";

    Promise.all([fetchProducts(), fetchHighlights()])
        .then(([products, highlightedIds]) => {
            products.forEach(prod => {
                const div = document.createElement("div");
                div.className = "highlight-item";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = prod.id;
                checkbox.checked = highlightedIds.includes(prod.id);
                checkbox.addEventListener("change", () => {
                    const checked = container.querySelectorAll("input:checked");
                    if (checked.length > 5) {
                        checkbox.checked = false;
                        alert("Du kan bara välja max 5 highlights.");
                    }
                });

                const label = document.createElement("label");
                label.textContent = prod.name;

                div.append(checkbox, label);
                container.appendChild(div);
            });
        })
        .catch(err => console.error(err));
}

window.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("admin-form");
    if (!productForm) return;

    populateCategoryDropdown();
    renderAdminProducts();

    productForm.addEventListener("submit", event => {
        event.preventDefault();

        const selectedCategory = document.getElementById("product-category").value;
        const newCategory = document.getElementById("new-product-category").value.trim();
        const finalCategory = newCategory || selectedCategory;
        if (!finalCategory) {
            alert("Please select an existing category or enter a new one");
            return;
        }

        const product = {
            name: document.getElementById("product-name").value,
            brand: document.getElementById("product-brand").value,
            category: finalCategory,
            department: document.getElementById("product-department").value,
            price: parseFloat(document.getElementById("product-price").value),
            stock: parseInt(document.getElementById("product-stock").value),
            image1: document.getElementById("product-image1").value,
            image2: document.getElementById("product-image2").value || "",
            image3: document.getElementById("product-image3").value || "",
        };

        postProduct(product);
        productForm.reset();
    });

    const categoryDropdown = document.getElementById("product-category");
    const newCategoryInput = document.getElementById("new-product-category");
    categoryDropdown.addEventListener("change", () => newCategoryInput.value = "");
    newCategoryInput.addEventListener("input", () => categoryDropdown.value = "");

    // Redirect knapp
    const viewProductsBtn = document.getElementById("view-products-btn");
    if (viewProductsBtn) viewProductsBtn.addEventListener("click", () => window.location.href = "index.html");

    const highlightsForm = document.getElementById("highlights-form");
    if (highlightsForm) {
        renderHighlightsSelection();
        highlightsForm.addEventListener("submit", async e => {
            e.preventDefault();
            const selected = Array.from(
                document.querySelectorAll("#highlights-list input:checked")
            ).map(cb => cb.value);

            try {
                const res = await fetch(`${API_BASE}/highlights`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(selected),
                });
                if (!res.ok) throw new Error("Failed to save highlights");
                alert("Highlights sparade!");
            } catch (err) {
                console.error(err);
                alert("Kunde inte spara highlights: " + err.message);
            }
        });
    }
});

async function renderAdminProducts() {
  const productContainer = document.getElementById("view-admin-products");
  if (!productContainer) return;

  try {
    
    let products = await fetchProducts();
    products.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
    const latestFive = products.slice(0, 5);

    productContainer.innerHTML = "";
    latestFive.forEach(prod => {
      const card = createProductCard(prod);
      productContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function createAdminProductCard(product) {
    const card = document.createElement("div");
    card.className = "admin-product-card";
    card.innerHTML = `
        <img src="${product.image1}" alt="${product.name}" />
        <h4>${product.name}</h4>
        <p>Brand: ${product.brand}</p>
        <p>Price: ${product.price} kr</p>
        <p>Stock: ${product.stock}</p>
    `;
    card.onclick = () => showAdminEditProductPopup(product);
    return card;
}

async function renderAllProductsByDepartment() {
    const container = document.getElementById("edit-products");
    if (!container) return;
    try {
        const products = await fetchProducts();
        const deps = [...new Set(products.map(p => p.department))];
        deps.forEach(dep => {
            const sect = document.createElement("div");
            sect.className = "department-section";
            const title = document.createElement("h3");
            title.textContent = dep;
            sect.appendChild(title);
            products.filter(p => p.department === dep)
                    .forEach(p => sect.appendChild(createAdminProductCard(p)));
            container.appendChild(sect);
        });
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

function showAdminEditProductPopup(product) {
    const overlay = document.createElement("div");
    overlay.className = "product-popup-overlay";
    const popup = document.createElement("div");
    popup.className = "product-popup";
    const closeBtn = document.createElement("button");
    closeBtn.className = "popup-close";
    closeBtn.textContent = "×";
    closeBtn.onclick = () => document.body.removeChild(overlay);

    const form = document.createElement("form");
    form.className = "popup-content admin-edit-form";
    form.innerHTML = Object.entries({
        name: product.name,
        brand: product.brand,
        category: product.category,
        department: product.department,
        price: product.price,
        stock: product.stock,
        image1: product.image1,
        image2: product.image2 || "",
        image3: product.image3 || ""
    }).map(([key, val]) => `
        <div class="form-row">
          <label>${key.charAt(0).toUpperCase()+key.slice(1)}:
            <input name="${key}" value="${val}" ${['price','stock'].includes(key)?'type="number" required':''}>
          </label>
        </div>
    `).join("") + `
        <div class="form-row"><button type="submit">Save</button></div>
    `;

    form.onsubmit = async e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        data.price = parseFloat(data.price);
        data.stock = parseInt(data.stock);
        await editProduct(product.id, data);
        document.body.removeChild(overlay);
        renderAllProductsByDepartment();
    };

    popup.append(closeBtn, form);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}


renderAllProductsByDepartment();
