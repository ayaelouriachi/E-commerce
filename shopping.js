import { initProducts } from './products.js';
let products = initProducts();	
// Initialiser localStorage si nécessaire
if (!localStorage.getItem('products')) {
  localStorage.setItem('products', JSON.stringify(products));
}

// Initialiser les catégories par défaut si nécessaire
if (!localStorage.getItem('categories')) {
  const defaultCategories = [
    { name: 'clothing', image: 'images/category1.png' },
    { name: 'makeup', image: 'images/category3.png' },
    { name: 'accessories', image: 'images/category2.png' }
  ];
  localStorage.setItem('categories', JSON.stringify(defaultCategories));
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCount = document.getElementById('cart-count-nav');
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const productsGrid = document.getElementById("products-grid");

// Fonction pour rafraîchir les produits depuis localStorage
function refreshProducts() {
  // Toujours récupérer les dernières données depuis localStorage
  products = JSON.parse(localStorage.getItem('products')) || [];
}

function updateCartCount() {
  cartCount.textContent = cart.length;
}

function showToast(message, duration = 3000) {
  toastMessage.textContent = message;
  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, duration);
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast("Product added to cart!");
}

function navigateToProductDetails(productId) {
  window.location.href = `productDetails.html?id=${productId}`;
}

function createProductCardHTML(product) {
  return `
    <div class="product-image">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <h3 class="product-title">${product.title}</h3>
      <p class="product-price">$${product.price.toFixed(2)}</p>
      <p class="product-description">${product.description}</p>
      <div class="product-actions">
        <button class="btn btn-sm add-to-cart" data-id="${product.id}">Add to Cart</button>
        <button class="btn-secondary btn-sm view-details" data-id="${product.id}">View Details</button>
      </div>
    </div>
  `;
}

function addProductCardEventListeners(productCard, product) {
  productCard.addEventListener("click", function(e) {
    const isAddToCart = e.target.classList.contains("add-to-cart");
    const isViewDetails = e.target.classList.contains("view-details");

    if (!isAddToCart && !isViewDetails) {
      showProductDetails(product.id);
    }
  });
}

function addProductButtonEventListeners() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", function(e) {
      e.stopPropagation(); 
      const productId = parseInt(this.getAttribute("data-id"));
      const product = products.find(p => p.id === productId);
      addToCart(product);
    });
  });

  document.querySelectorAll(".view-details").forEach(button => {
    button.addEventListener("click", function(e) {
      e.stopPropagation(); 
      const productId = parseInt(this.getAttribute("data-id"));
      navigateToProductDetails(productId);
    });
  });
}

// Met à jour dynamiquement les boutons de filtre basés sur les catégories dans localStorage
// Met à jour dynamiquement les boutons de filtre basés sur les catégories dans localStorage
function updateFilterButtons() {
  const filterContainer = document.querySelector('.filter-buttons');
  if (!filterContainer) return;
  
  const categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'clothing', image: 'images/category1.png' },
    { name: 'makeup', image: 'images/category3.png' },
    { name: 'accessories', image: 'images/category2.png' }
  ];

  // Garder le bouton "All" et ajouter les autres catégories
  filterContainer.innerHTML = `
    <button class="filter-btn active" data-filter="all">All Products</button>
    ${categories.map(cat => `
      <button class="filter-btn" data-filter="${cat.name}">${cat.name}</button>
    `).join('')}
  `;

  // Ajouter les écouteurs d'événements
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
      const filter = this.getAttribute("data-filter");
      
      // Remove active class from all buttons first
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
      });
      
      // Add active class only to the clicked button
      this.classList.add("active");
      
      displayProducts(filter);
    });
  });
}

function displayProducts(category = "all") {
  // Rafraîchir les produits depuis localStorage
  refreshProducts();
  
  
  let filteredProducts = products;

  if (category !== "all") {
    filteredProducts = products.filter(product => product.category === category);
  }

  productsGrid.innerHTML = "";
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `<div class="no-results-wrapper">
        <div class="no-results">
          <h3>No products found in this category</h3>
          
        </div>
      </div>`;
    return;
  }

  filteredProducts.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.setAttribute("data-id", product.id);
    productCard.innerHTML = createProductCardHTML(product);
    
    addProductCardEventListeners(productCard, product);
    productsGrid.appendChild(productCard);
  });

  addProductButtonEventListeners();
}

function showProductDetails(productId) {
  // Rafraîchir les produits depuis localStorage
  refreshProducts();
  
  const product = products.find(p => p.id === productId);
  const productDetail = document.getElementById("product-detail");

  productDetail.innerHTML = `
    <div class="product-detail-image">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="product-detail-info">
      <h2 class="product-detail-title">${product.title}</h2>
      <span class="product-detail-category">${product.category}</span>
      <p class="product-detail-price">$${product.price.toFixed(2)}</p>
      <div class="product-detail-description">
        ${product.description}
      </div>
      <div class="product-detail-actions">
        <button class="btn add-to-cart-detail" style="margin-top:10px;" data-id="${product.id}">Add to Cart</button>
        <button class="btn-secondary view-full-details" style="height:40px; padding-top:14px;padding-bottom:28px; font-size:14px; font-weight:600;" data-id="${product.id}">View Full Details</button>
      </div>
    </div>
  `;

  document.querySelector(".add-to-cart-detail").addEventListener("click", function() {
    addToCart(product);
  });

  document.querySelector(".view-full-details").addEventListener("click", function() {
    navigateToProductDetails(product.id);
    document.getElementById("product-modal").classList.remove("active");
  });

  document.getElementById("product-modal").classList.add("active");
}

function initializeModalClose() {
  const closeButton = document.querySelector(".modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", function() {
      document.getElementById("product-modal").classList.remove("active");
    });
  }
  
  const productModal = document.getElementById("product-modal");
  if (productModal) {
    productModal.addEventListener("click", function(e) {
      if (e.target === this) {
        this.classList.remove("active");
      }
    });
  }
}

function performSearch() {
  // Rafraîchir les produits depuis localStorage
  refreshProducts();
  
  const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
  
  if (searchTerm === '') return;
  
  const searchResults = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  );
  
  productsGrid.innerHTML = "";
  
  if (searchResults.length === 0) {
    productsGrid.innerHTML = `
      <div class="no-results-wrapper">
        <div class="no-results">
          <h3>No products found matching "${searchTerm}"</h3>
          <p>Try different keywords or browse our categories</p>
        </div>
      </div>
    `;
  } else {
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-filter") === "all") {
        btn.classList.add("active");
      }
    });
    
    searchResults.forEach(product => {
      const productCard = document.createElement("div");
      productCard.className = "product-card";
      productCard.setAttribute("data-id", product.id);
      productCard.innerHTML = createProductCardHTML(product);
      
      addProductCardEventListeners(productCard, product);
      productsGrid.appendChild(productCard);
    });
    
    addProductButtonEventListeners();
  }
  
  showToast(`Found ${searchResults.length} products matching "${searchTerm}"`);
  
  document.querySelector('.search-form').classList.remove('active');
  document.querySelector('.search-overlay').classList.remove('active');
  
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

// Met à jour les sections de catégories dans la page d'accueil
function updateCategoryCards() {
  const categoriesGrid = document.querySelector('.categories-grid');
  if (!categoriesGrid) return;

  const categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'clothing', image: 'images/category1.png' },
    { name: 'makeup', image: 'images/category3.png' },
    { name: 'accessories', image: 'images/category2.png' }
  ];

  categoriesGrid.innerHTML = categories.map(category => `
    <div class="category-card" data-category="${category.name}">
      <img src="${category.image}" alt="${category.name}">
      <div class="category-content">
        <h3>${category.name}</h3>
      </div>
    </div>
  `).join('');

  // Ajouter les écouteurs d'événements pour les cartes de catégories
  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", function() {
      const category = this.getAttribute("data-category");
      
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
      });
      const matchingButton = document.querySelector(`.filter-btn[data-filter="${category}"]`);
      if (matchingButton) {
        matchingButton.classList.add("active");
      }
      
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
      
      displayProducts(category);
    });
  });
}

// Crée ou met à jour les sections de produits en vedette par catégorie
function displayFeaturedSections() {
  const categories = JSON.parse(localStorage.getItem('categories')) || [
    { name: 'clothing', image: 'images/category1.png' },
    { name: 'makeup', image: 'images/category3.png' },
    { name: 'accessories', image: 'images/category2.png' }
  ];
  
  // Créer un conteneur pour les sections en vedette si ce n'est pas déjà fait
  let featuredSectionsContainer = document.getElementById('featured-sections');
  if (!featuredSectionsContainer) {
    featuredSectionsContainer = document.createElement('div');
    featuredSectionsContainer.id = 'featured-sections';
    featuredSectionsContainer.className = 'featured-sections-container';
    
    // Insérer avant la section produits ou à la fin du contenu principal
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.parentNode.insertBefore(featuredSectionsContainer, productsSection);
    } else {
      document.querySelector('main') ? 
        document.querySelector('main').appendChild(featuredSectionsContainer) : 
        document.body.appendChild(featuredSectionsContainer);
    }
  }

  

  // Ajouter les écouteurs d'événements pour "View All"
 
}

function getFeaturedProducts(category) {
  const categoryProducts = products.filter(p => p.category === category);
  const featured = categoryProducts.slice(0, 4); // Prendre les 4 premiers
  
  if (featured.length === 0) {
    return '<p class="no-featured-products">No products in this category yet.</p>';
  }
  
  return featured.map(product => `
    <div class="featured-product" data-id="${product.id}">
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <p>$${product.price.toFixed(2)}</p>
    </div>
  `).join('');
}

function initializeSearch() {
  const searchIcon = document.querySelector('.fa-search');
  if (!searchIcon) return;
  
  if (!document.querySelector('.search-overlay')) {
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'search-overlay';
    document.body.appendChild(searchOverlay);
    
    const searchForm = document.createElement('div');
    searchForm.className = 'search-form';
    searchForm.innerHTML = `
      <div class="search-form-container">
        <input type="text" id="search-input" placeholder="Search products...">
        <button id="search-button" type="button">
          <i class="fas fa-search"></i>
        </button>
      </div>
      <button id="close-search" type="button">
        <i class="fas fa-times"></i>
      </button>
    `;
    document.body.appendChild(searchForm);

    searchIcon.addEventListener('click', function() {
      searchForm.classList.add('active');
      searchOverlay.classList.add('active');
      document.getElementById('search-input').focus();
    });
    
    document.getElementById('close-search').addEventListener("click", function() {
      searchForm.classList.remove('active');
      searchOverlay.classList.remove('active');
    });

    searchOverlay.addEventListener('click', function() {
      searchForm.classList.remove('active');
      searchOverlay.classList.remove('active');
    });

    document.getElementById('search-button').addEventListener('click', performSearch);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

// Écouter les changements de stockage pour mettre à jour l'affichage en temps réel
window.addEventListener('storage', function(e) {
  if (e.key === 'products') {
    refreshProducts();
    displayProducts();
    displayFeaturedSections();
  }
  if (e.key === 'categories') {
    updateFilterButtons();
    updateCategoryCards();
    displayFeaturedSections();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Mise à jour des éléments de catégorie
  updateCategoryCards();
  
  // Check if we're on a page with product display
  const productsGrid = document.getElementById("products-grid");
  if (productsGrid) {
    updateFilterButtons();
    displayProducts();
  }
  
  // Update cart count regardless of page
  updateCartCount();
  
  // Create featured sections for each category
  displayFeaturedSections();
  
  // Initialize modal if it exists
  if (document.getElementById("product-modal")) {
    initializeModalClose();
  }
  
  // Initialize search functionality (should work on all pages)
  initializeSearch();

  // Handle newsletter form if it exists
  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function(e) {
      e.preventDefault();
      const emailInput = this.querySelector("input[type=email]");

      if (emailInput.value) {
        showToast("Thank you for subscribing!");
        emailInput.value = "";
      }
    });
  }
});
