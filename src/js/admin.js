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
