const API_BASE = "http://localhost:3000"
import { showProductPopup } from "./product-popup.js"

async function fetchLatestProducts(limit = 8) {
  try {
    const response = await fetch(`${API_BASE}/products`)
    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }
    const products = await response.json()

    return products.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit)
  } catch (error) {
    console.error("Error fetching latest products:", error)
    return []
  }
}

// Check if a product is new (added within the last 7 days)
function isNewProduct(product) {
  const productDate = new Date(product.timestamp)
  const currentDate = new Date()
  const differenceInTime = currentDate.getTime() - productDate.getTime()
  const differenceInDays = differenceInTime / (1000 * 3600 * 24)

  return differenceInDays <= 7
}

// Check if a product is one of the latest additions (top 3 newest)
function isLatestProduct(product, allProducts) {
  const newestProducts = allProducts.slice(0, 3)
  return newestProducts.some((p) => p.id === product.id)
}

async function initProductSlider() {
  const sliderContainer = document.querySelector(".img_slider")
  if (!sliderContainer) return

  const sliderTitle = document.createElement("h3")
  sliderTitle.className = "slider-title"
  sliderTitle.textContent = "LATEST ARRIVALS"
  sliderContainer.parentNode.insertBefore(sliderTitle, sliderContainer)

  const sliderImgContainer = document.querySelector(".sliderimg")

  try {
    const latestProducts = await fetchLatestProducts(8)

    if (latestProducts.length === 0) {
      console.error("No products found")
      return
    }

    sliderImgContainer.innerHTML = ""

    // Add the last two products as first (for infinite loop effect)
    const lastProducts = latestProducts.slice(-2)
    lastProducts.forEach((product, index) => {
      addProductToSlider(product, sliderImgContainer, true, `lastclone-${index}`, latestProducts)
    })

    latestProducts.forEach((product) => {
      addProductToSlider(product, sliderImgContainer, false, null, latestProducts)
    })

    // Add the first two products as last (for infinite loop effect)
    const firstProducts = latestProducts.slice(0, 2)
    firstProducts.forEach((product, index) => {
      addProductToSlider(product, sliderImgContainer, true, `first-clone-${index}`, latestProducts)
    })

    initSliderControls()
  } catch (error) {
    console.error("Error initializing product slider:", error)
  }
}

function addProductToSlider(product, container, isClone = false, cloneId = null, allProducts = []) {
  const slideWrapper = document.createElement("div")
  slideWrapper.className = "slider-product"

  const img = document.createElement("img")
  img.src = product.image1
  img.alt = product.name
  if (cloneId) {
    img.id = cloneId
  }

  // Add NEW or LATEST tag if the product is new or one of the latest additions
  if (!isClone) {
    if (isNewProduct(product)) {
      const newTag = document.createElement("div")
      newTag.className = "product-tag new"
      newTag.textContent = "NEW"
      slideWrapper.appendChild(newTag)
    } else if (isLatestProduct(product, allProducts)) {
      const latestTag = document.createElement("div")
      latestTag.className = "product-tag latest"
      latestTag.textContent = "LATEST"
      slideWrapper.appendChild(latestTag)
    }
  }

  const productInfo = document.createElement("div")
  productInfo.className = "product-info"

  const productName = document.createElement("h4")
  productName.textContent = product.name

  const productPrice = document.createElement("p")
  productPrice.className = "product-price"
  productPrice.textContent = `${product.price} kr`

  const productBrand = document.createElement("p")
  productBrand.className = "product-brand"
  productBrand.textContent = product.brand

  productInfo.appendChild(productName)
  productInfo.appendChild(productBrand)
  productInfo.appendChild(productPrice)

  slideWrapper.appendChild(img)
  slideWrapper.appendChild(productInfo)

  if (!isClone) {
    slideWrapper.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()
      showProductPopup(product)
    })
    slideWrapper.style.cursor = "pointer"
  }

  container.appendChild(slideWrapper)
}

function initSliderControls() {
  const sliderImage = document.querySelector(".sliderimg")
  if (!sliderImage) return

  const sliderProducts = document.querySelectorAll(".slider-product")
  if (sliderProducts.length === 0) return

  const prevBtn = document.querySelector("#prevBtn")
  const nextBtn = document.querySelector("#nextBtn")

  const containerWidth = document.querySelector(".img_slider").clientWidth
  const cardWidth = sliderProducts[0].offsetWidth + 20
  const visibleCards = Math.floor(containerWidth / cardWidth)

  let counter = 2

  sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`

  const autoScrollIndicator = document.createElement("div")
  autoScrollIndicator.className = "auto-scroll-indicator"
  autoScrollIndicator.innerHTML = '<div class="indicator-dot"></div>'
  document.querySelector(".img_slider").appendChild(autoScrollIndicator)

  nextBtn?.addEventListener("click", () => {
    if (counter >= sliderProducts.length - visibleCards) return
    moveToNextSlide()
  })

  prevBtn?.addEventListener("click", () => {
    if (counter <= 0) return
    moveToPrevSlide()
  })

  function moveToNextSlide() {
    sliderImage.style.transition = "transform 0.4s ease-in-out"
    counter++
    sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`
    updateAutoScrollIndicator()
  }

  function moveToPrevSlide() {
    sliderImage.style.transition = "transform 0.4s ease-in-out"
    counter--
    sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`
    updateAutoScrollIndicator()
  }

  function updateAutoScrollIndicator() {
    // Reset animation
    const dot = document.querySelector(".indicator-dot")
    dot.style.animation = "none"
    void dot.offsetWidth // Trigger reflow
    dot.style.animation = null

    // Restart animation
    dot.style.animation = `autoScrollProgress ${AUTO_SCROLL_INTERVAL / 1000}s linear`
  }

  // Handle infinite loop
  sliderImage.addEventListener("transitionend", () => {
    if (counter <= 1) {
      sliderImage.style.transition = "none"
      counter = sliderProducts.length - 3
      sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`
    }

    if (counter >= sliderProducts.length - 2) {
      sliderImage.style.transition = "none"
      counter = 2
      sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`
    }
  })

  const AUTO_SCROLL_INTERVAL = 4000

  let autoSlideInterval = setInterval(() => {
    if (counter >= sliderProducts.length - visibleCards) {
      // Reset to beginning when we reach the end
      sliderImage.style.transition = "none"
      counter = 2
      sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`

      void sliderImage.offsetWidth

      moveToNextSlide()
    } else {
      moveToNextSlide()
    }
  }, AUTO_SCROLL_INTERVAL)

  updateAutoScrollIndicator()

  // Pause auto-scroll when user hovers over the slider
  sliderImage.addEventListener("mouseenter", () => {
    clearInterval(autoSlideInterval)
    document.querySelector(".indicator-dot").style.animationPlayState = "paused"
  })

  // Resume auto-scroll when user leaves the slider
  sliderImage.addEventListener("mouseleave", () => {
    autoSlideInterval = setInterval(() => {
      if (counter >= sliderProducts.length - visibleCards) {
        sliderImage.style.transition = "none"
        counter = 2
        sliderImage.style.transform = `translateX(${-counter * cardWidth}px)`
        void sliderImage.offsetWidth
        moveToNextSlide()
      } else {
        moveToNextSlide()
      }
    }, AUTO_SCROLL_INTERVAL)

    document.querySelector(".indicator-dot").style.animationPlayState = "running"
  })

  // Stop auto-slide when user interacts with slider buttons
  prevBtn?.addEventListener("click", () => {
    clearInterval(autoSlideInterval)
    document.querySelector(".indicator-dot").style.animation = "none"
  })

  nextBtn?.addEventListener("click", () => {
    clearInterval(autoSlideInterval)
    document.querySelector(".indicator-dot").style.animation = "none"
  })

  // Handle window resize to prevent layout shifts
  window.addEventListener("resize", () => {
    const newContainerWidth = document.querySelector(".img_slider").clientWidth
    const newCardWidth = sliderProducts[0].offsetWidth + 20

    sliderImage.style.transition = "none"
    sliderImage.style.transform = `translateX(${-counter * newCardWidth}px)`
  })
}

export { initProductSlider }

document.addEventListener("DOMContentLoaded", initProductSlider)
