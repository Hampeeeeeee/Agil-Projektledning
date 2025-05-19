import { fetchCategories } from "../main.js";

export function populateCategoryDropdown() {
    const categoryDropdown = document.getElementById("product-category");

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

document.addEventListener("DOMContentLoaded", () => {
    populateCategoryDropdown();
});

// Function to post pruduct from admin page to backend
async function postProduct(product) {
    try {
        const response = await fetch("http://localhost:3000/products", {
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
        console.log("Product added:", data);
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

const productForm = document.getElementById("admin-form");
productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const product = {
        name: document.getElementById("product-name").value,
        brand: document.getElementById("product-brand").value,
        category: document.getElementById("product-category").value,
        department: document.getElementById("product-department").value,
        price: parseFloat(document.getElementById("product-price").value),
        image1: document.getElementById("product-image1").value,
        image2: document.getElementById("product-image2").value,
        image3: document.getElementById("product-image3").value,
    };

    postProduct(product);
});
