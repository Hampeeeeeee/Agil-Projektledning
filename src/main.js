const API_BASE = "http://localhost:3000";

async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function createProductCard(product) {
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
    <p>Price: ${product.price} kr</p>
`;
  return card;
}

// Update the displayProducts function to handle direct category filtering without requiring a specific department page
async function displayProducts() {
  const productContainer = document.getElementById("product-container");
  if (!productContainer) return; // Exit if container doesn't exist on this page

  try {
    // Get URL parameters for filtering
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get("category");
    const departmentFilter = urlParams.get("department"); // Add support for department as a query parameter

    // Get current page to determine department filter if not specified in URL
    const currentPage = window.location.pathname.split("/").pop();
    let pageDepartment = null;

    if (currentPage === "men.html") {
      pageDepartment = "Men";
    } else if (currentPage === "women.html") {
      pageDepartment = "Women";
    } else if (currentPage === "unisex.html") {
      pageDepartment = "Unisex";
    }

    // Use department from URL parameter if available, otherwise use page-based department
    const finalDepartmentFilter = departmentFilter || pageDepartment;

    // Fetch and filter products
    const products = await fetchProducts();
    let filteredProducts = products;

    // Apply department filter if specified
    if (finalDepartmentFilter) {
      filteredProducts = filteredProducts.filter(
        (product) => product.department === finalDepartmentFilter
      );
    }

    // Apply category filter if specified
    if (categoryFilter) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === categoryFilter
      );

      // Update page title to show what category we're viewing
      const pageTitle = document.querySelector("h1");
      if (pageTitle) {
        const department = finalDepartmentFilter || "All";
        pageTitle.textContent = `${department}'s ${categoryFilter}`;
      }
    }

    // Clear container before adding filtered products
    productContainer.innerHTML = "";

    // Show message if no products found
    if (filteredProducts.length === 0) {
      productContainer.innerHTML =
        '<p class="no-products">No products found in this category.</p>';
      return;
    }

    // Display filtered products
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

// Initialize the page
displayProducts();

// Image slider code (keep this part unchanged)
const sliderImage = document.querySelector(".sliderimg");
if (sliderImage) {
  const sliderImages = document.querySelectorAll(".sliderimg img");

  // Buttons
  const prevBtn = document.querySelector("#prevBtn");
  const nextBtn = document.querySelector("#nextBtn");

  // Counter
  let counter = 1;
  const size = sliderImages[0]?.clientWidth || 0;

  if (size > 0) {
    sliderImage.style.transform = "translateX(" + -size * counter + "px)";

    // Button Listeners
    nextBtn?.addEventListener("click", () => {
      if (counter >= sliderImages.length - 1) return;

      sliderImage.style.transition = "transform 0.4s ease-in-out";
      counter++;
      sliderImage.style.transform = "translateX(" + -size * counter + "px)";
    });

    prevBtn?.addEventListener("click", () => {
      if (counter <= 0) return;

      sliderImage.style.transition = "transform 0.4s ease-in-out";
      counter--;
      sliderImage.style.transform = "translateX(" + -size * counter + "px)";
    });

    sliderImage.addEventListener("transitionend", () => {
      if (sliderImages[counter]?.id === "lastclone") {
        sliderImage.style.transition = "none";
        counter = sliderImages.length - 2;
        sliderImage.style.transform = "translateX(" + -size * counter + "px)";
      }

      if (sliderImages[counter]?.id === "first-clone") {
        sliderImage.style.transition = "none";
        counter = 1;
        sliderImage.style.transform = "translateX(" + -size * counter + "px)";
      }
    });

    // Auto-slide every 6 seconds
    const autoSlide = setInterval(() => {
      if (counter >= sliderImages.length - 1) return;

      sliderImage.style.transition = "transform 0.4s ease-in-out";
      counter++;
      sliderImage.style.transform = "translateX(" + -size * counter + "px)";
    }, 6000);
  }
}
