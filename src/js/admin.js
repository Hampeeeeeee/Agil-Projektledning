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
      })
  
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
  
      const data = await response.json()
      console.log("Product added:", data)
      alert("Product added successfully!")
      document.getElementById("admin-form").reset()
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Error adding product: " + error.message)
    }
  }
  
  const productForm = document.getElementById("admin-form")
  productForm.addEventListener("submit", (event) => {
    event.preventDefault()
  
    // Get values from both category fields
    const selectedCategory = document.getElementById("product-category").value
    const newCategory = document.getElementById("new-product-category").value.trim()
  
    // Determine which category to use (new one takes precedence if provided)
    const finalCategory = newCategory ? newCategory : selectedCategory
  
    // Validate that a category is selected or entered
    if (!finalCategory) {
      alert("Please select an existing category or enter a new one")
      return
    }
  
    const product = {
      name: document.getElementById("product-name").value,
      brand: document.getElementById("product-brand").value,
      category: finalCategory,
      department: document.getElementById("product-department").value,
      price: Number.parseFloat(document.getElementById("product-price").value),
      image1: document.getElementById("product-image1").value,
      image2: document.getElementById("product-image2").value || "",
      image3: document.getElementById("product-image3").value || "",
    }
  
    postProduct(product)
  })
  
  // Add event listener to clear the other field when one is being used
  document.getElementById("product-category").addEventListener("change", function () {
    if (this.value) {
      document.getElementById("new-product-category").value = ""
    }
  })
  
  document.getElementById("new-product-category").addEventListener("input", function () {
    if (this.value.trim()) {
      document.getElementById("product-category").value = ""
    }
  })