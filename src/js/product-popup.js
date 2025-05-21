// Function to create and show the product popup
export function showProductPopup(product) {
    // Create overlay
    const overlay = document.createElement("div")
    overlay.className = "product-popup-overlay"
  
    // Create popup content
    const popup = document.createElement("div")
    popup.className = "product-popup"
  
    // Close button
    const closeBtn = document.createElement("button")
    closeBtn.className = "popup-close"
    closeBtn.innerHTML = "×"
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active")
      setTimeout(() => {
        document.body.removeChild(overlay)
      }, 300)
    })
  
    // Create content container
    const content = document.createElement("div")
    content.className = "popup-content"
  
    // Images section
    const imagesSection = document.createElement("div")
    imagesSection.className = "popup-images"
  
    // Main image
    const mainImage = document.createElement("img")
    mainImage.className = "popup-main-image"
    mainImage.src = product.image1
    mainImage.alt = product.name
  
    // Thumbnails container
    const thumbnails = document.createElement("div")
    thumbnails.className = "popup-thumbnails"
  
    // Add all available images as thumbnails
    const images = [product.image1, product.image2, product.image3].filter((img) => img)
  
    images.forEach((img, index) => {
      const thumb = document.createElement("img")
      thumb.className = "popup-thumbnail"
      thumb.src = img
      thumb.alt = `${product.name} - Image ${index + 1}`
      if (index === 0) thumb.classList.add("active")
  
      thumb.addEventListener("click", () => {
        // Update main image
        mainImage.src = img
        // Update active thumbnail
        document.querySelectorAll(".popup-thumbnail").forEach((t) => t.classList.remove("active"))
        thumb.classList.add("active")
      })
  
      thumbnails.appendChild(thumb)
    })
  
    imagesSection.appendChild(mainImage)
    imagesSection.appendChild(thumbnails)
  
    // Details section
    const detailsSection = document.createElement("div")
    detailsSection.className = "popup-details"
  
    // Product title
    const title = document.createElement("h2")
    title.className = "popup-title"
    title.textContent = product.name
  
    // Brand
    const brand = document.createElement("p")
    brand.className = "popup-brand"
    brand.textContent = `Brand: ${product.brand}`
  
    // Category
    const category = document.createElement("p")
    category.className = "popup-category"
    category.textContent = `Category: ${product.category}`
  
    // Department
    const department = document.createElement("p")
    department.className = "popup-department"
    department.textContent = `Department: ${product.department}`
  
    // Price
    const price = document.createElement("p")
    price.className = "popup-price"
    price.textContent = `${product.price} kr`
  
    // Stock status
    const stock = document.createElement("p")
    stock.className = "popup-stock"
  
    if (product.stock === 0) {
      stock.textContent = "Out of stock"
      stock.classList.add("out-of-stock")
    } else if (product.stock <= 3) {
      stock.textContent = `Low stock: ${product.stock} left`
      stock.classList.add("low-stock")
    } else {
      stock.textContent = `In stock: ${product.stock} available`
      stock.classList.add("in-stock")
    }
  
    // Actions
    const actions = document.createElement("div")
    actions.className = "popup-actions"
  
    // Add to cart button
    const addToCartBtn = document.createElement("button")
    addToCartBtn.className = "popup-add-to-cart"
    addToCartBtn.textContent = "Add to Cart"
    addToCartBtn.disabled = product.stock === 0
  
    // Wishlist button
    const wishlistBtn = document.createElement("button")
    wishlistBtn.className = "popup-wishlist"
    wishlistBtn.innerHTML = '<i class="bi bi-heart"></i>'
  
    wishlistBtn.addEventListener("click", () => {
      const icon = wishlistBtn.querySelector("i")
      icon.classList.toggle("filled")
      icon.classList.toggle("bi-heart")
      icon.classList.toggle("bi-heart-fill")
    })
  
    actions.appendChild(addToCartBtn)
    actions.appendChild(wishlistBtn)
  
    // Append all elements to details section
    detailsSection.appendChild(title)
    detailsSection.appendChild(brand)
    detailsSection.appendChild(category)
    detailsSection.appendChild(department)
    detailsSection.appendChild(price)
    detailsSection.appendChild(stock)
    detailsSection.appendChild(actions)
  
    // Append sections to content
    content.appendChild(imagesSection)
    content.appendChild(detailsSection)
  
    // Append everything to popup
    popup.appendChild(closeBtn)
    popup.appendChild(content)
  
    // Append popup to overlay
    overlay.appendChild(popup)
  
    // Add to body
    document.body.appendChild(overlay)
  
    // Force reflow to enable transition
    void overlay.offsetWidth
  
    // Show popup
    overlay.classList.add("active")
  
    // Close when clicking outside the popup
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active")
        setTimeout(() => {
          document.body.removeChild(overlay)
        }, 300)
      }
    })
  }
  