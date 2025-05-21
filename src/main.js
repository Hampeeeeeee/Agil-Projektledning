const API_BASE = "http://localhost:3000"

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}/products`)
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json()
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE}/categories`)
  if (!response.ok) {
    console.error("Failed to fetch categories:", response.status, response.statusText)
    throw new Error("Network response was not ok")
  }
  const data = await response.json()
  return data
}

export function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"
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
`
  return card
}

export async function displayProducts() {
  const productContainer = document.getElementById("product-container")
  if (!productContainer) return

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const categoryFilter = urlParams.get("category")
    const departmentFilter = urlParams.get("department")

    const currentPage = window.location.pathname.split("/").pop()
    let pageDepartment = null

    if (currentPage === "men.html") {
      pageDepartment = "Men"
    } else if (currentPage === "women.html") {
      pageDepartment = "Women"
    } else if (currentPage === "unisex.html") {
      pageDepartment = "Unisex"
    }

    const finalDepartmentFilter = departmentFilter || pageDepartment

    const products = await fetchProducts()
    let filteredProducts = products

    if (finalDepartmentFilter) {
      filteredProducts = filteredProducts.filter((product) => product.department === finalDepartmentFilter)
    }

    if (categoryFilter) {
      filteredProducts = filteredProducts.filter((product) => product.category === categoryFilter)

      const pageTitle = document.querySelector("h1")
      if (pageTitle) {
        const department = finalDepartmentFilter || "All"
        pageTitle.textContent = `${department}'s ${categoryFilter}`
      }
    }

    productContainer.innerHTML = ""

    if (filteredProducts.length === 0) {
      productContainer.innerHTML = '<p class="no-products">No products found in this category.</p>'
      return
    }

    filteredProducts.forEach((product) => {
      const card = createProductCard(product)
      productContainer.appendChild(card)
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    productContainer.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>'
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayProducts()

  const adminForm = document.getElementById("admin-login-form")
  if (adminForm) {
    adminForm.addEventListener("submit", (event) => {
      event.preventDefault()
      window.location.href = "admin.html"
    })
    adminForm.reset()
  }

  const isAdminPage = window.location.pathname.includes("admin.html")
  if (isAdminPage) {
    import("./js/admin.js")
      .then((adminModule) => {
        // Admin module will initialize itself
      })
      .catch((err) => {
        console.error("Failed to load admin module:", err)
      })
  }
})

export { API_BASE }
