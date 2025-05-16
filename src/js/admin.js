document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("product-form");
  const categoryList = document.getElementById("category-list");

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const productName = document.getElementById("product-name").value;
    const productCategory = document.getElementById("product-category").value;
    const productImage = document.getElementById("product-image").files[0];

    if (productName && productCategory && productImage) {
      const reader = new FileReader();

      reader.onload = () => {
        console.log("Product added:", {
          name: productName,
          category: productCategory,
          image: reader.result,
        });

        alert("Product added successfully!");
        productForm.reset();
      };

      reader.readAsDataURL(productImage);
    } else {
      alert("Please fill in all fields.");
    }
  });

  // Example: Add categories dynamically
  const categories = ["Men", "Women", "Unisex"];
  categories.forEach((category) => {
    const li = document.createElement("li");
    li.textContent = category;
    categoryList.appendChild(li);
  });
});
