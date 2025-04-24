
const products = [
  {
    id: 1,
    title: "Premium T-Shirt",
    category: "clothing",
    price: 29.99,
    description: "Soft and comfortable premium cotton t-shirt with a modern fit. Available in multiple colors and sizes.",
    image: "images/shirt.png"
  },
  {
    id: 2,
    title: "Classic Jeans",
    category: "clothing",
    price: 59.99,
    description: "Classic denim jeans with a straight fit design. Durable and versatile for everyday wear.",
    image: "images/jeans.png"
  },
  {
    id: 3,
    title: "Liquid Foundation",
    category: "makeup",
    price: 24.99,
    description: "Buildable coverage foundation with a natural finish, available in 12 shades.",
    image: "images/Fon.png"
  },
  {
    id: 4,
    title: "Smartphone Case",
    category: "accessories",
    price: 19.99,
    description: "Durable and stylish smartphone case made from premium materials to protect your device.",
    image: "images/phone.png"
  },
  {
    id: 5,
    title: "Summer Dress",
    category: "clothing",
    price: 49.99,
    description: "Lightweight and breathable summer dress with a floral pattern. Perfect for warm weather.",
    image: "images/Robe.png"
  },
  {
    id: 6,
    title: "Matte Lipstick Set",
    category: "makeup",
    price: 34.99,
    description: "Set of 5 long‑wear matte lipsticks in a range of bold shades.",
    image: "images/Lip.png"
  },
  {
    id: 7,
    title: "Leather Wallet",
    category: "accessories",
    price: 39.99,
    description: "Genuine leather wallet with multiple card slots and a sleek design.",
    image: "images/Wal.png"
  },
  {
    id: 8,
    title: "Eyeshadow Palette",
    category: "makeup",
    price: 29.99,
    description: "12‑pan eyeshadow palette with a mix of mattes and shimmers for endless looks.",
    image: "images/eye.png"
  },
  {
    id: 9,
    title: "Winter Jacket",
    category: "clothing",
    price: 149.99,
    description: "Warm and windproof winter jacket with a stylish design and multiple pockets.",
    image: "images/jacket.png"
  },
  {
    id: 10,
    title: "Sunglasses",
    category: "accessories",
    price: 89.99,
    description: "Designer sunglasses with UV protection and polarized lenses for exceptional clarity.",
    image: "images/Sun.png"
  }
];


let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCount = document.getElementById('cart-count-nav');
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const productsGrid = document.getElementById("products-grid");


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


function displayProducts(category = "all") {
  let filteredProducts = products;

  if (category !== "all") {
    filteredProducts = products.filter(product => product.category === category);
  }

  productsGrid.innerHTML = "";

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


function initializeSearch() {
  const searchIcon = document.querySelector('.fa-search');
  

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


document.addEventListener('DOMContentLoaded', function() {
  
  displayProducts();
  updateCartCount();
  initializeModalClose();
  initializeSearch();
  
 
  document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function() {
      const filter = this.getAttribute("data-filter");
      
   
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
      });
      this.classList.add("active");
      
     
      displayProducts(filter);
    });
  });

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", function() {
      const category = this.getAttribute("data-category");
   
      document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("data-filter") === category) {
          btn.classList.add("active");
        }
      });
      
     
      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
      
     
      displayProducts(category);
    });
  });


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