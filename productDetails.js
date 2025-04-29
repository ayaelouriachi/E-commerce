// Load products from localStorage or use default products
const products = JSON.parse(localStorage.getItem('products')) || [
    {
      id: 1,
      title: "Premium T-Shirt",
      category: "clothing",
      price: 29.99,
      description: "Soft and comfortable premium cotton t-shirt with a modern fit.",
      image: "images/shirt.png",
      details: "Made from 100% breathable cotton, this unisize t-shirt features a classic round neckline, short sleeves, and a relaxed modern cut that suits most body types. Available in multiple colors, it's easy to pair with any outfit and perfect for daily wear."
    },
    {
      id: 2,
      title: "Classic Jeans",
      category: "clothing",
      price: 59.99,
      description: "Classic denim jeans with a straight fit design.",
      image: "images/jeans.png",
      details: "Crafted from durable denim, these straight-fit jeans offer comfort and timeless style. Features include a zip fly, five pockets, and reinforced stitching, making them ideal for everyday use."
    },
    {
      id: 3,
      title: "Liquid Foundation",
      category: "makeup",
      price: 24.99,
      description: "Buildable coverage foundation with a natural finish.",
      image: "images/Fon.png",
      details: "This liquid foundation offers medium to full buildable coverage with a smooth, natural finish. Lightweight and long-lasting, it blends effortlessly and is available in 12 inclusive shades to suit various skin tones."
    },
    {
      id: 4,
      title: "Smartphone Case",
      category: "accessories",
      price: 19.99,
      description: "Durable and stylish smartphone case made from premium materials.",
      image: "images/phone.png",
      details: "Protect your phone with this shock-absorbent, scratch-resistant case. Its slim, stylish design is made from high-quality TPU and polycarbonate for maximum durability and grip."
    },
    {
      id: 5,
      title: "Summer Dress",
      category: "clothing",
      price: 49.99,
      description: "Lightweight and breathable summer dress with a floral pattern.",
      image: "images/Robe.png",
      details: "Stay cool and stylish with this sleeveless summer dress, featuring a flattering A-line cut and breezy floral fabric. Perfect for casual outings or beach days."
    },
    {
      id: 6,
      title: "Matte Lipstick Set",
      category: "makeup",
      price: 34.99,
      description: "Set of 5 long‑wear matte lipsticks in a range of bold shades.",
      image: "images/Lip.png",
      details: "This set includes five richly pigmented matte lipsticks with a velvety texture and all-day wear. The formula is non-drying and glides on smoothly, offering bold color payoff in every swipe."
    },
    {
      id: 7,
      title: "Leather Wallet",
      category: "accessories",
      price: 39.99,
      description: "Genuine leather wallet with multiple card slots and a sleek design.",
      image: "images/Wal.png",
      details: "Handcrafted from premium leather, this slim wallet features multiple card slots, a bill compartment, and RFID protection. Elegant and functional for everyday use."
    },
    {
      id: 8,
      title: "Eyeshadow Palette",
      category: "makeup",
      price: 29.99,
      description: "12‑pan eyeshadow palette with a mix of mattes and shimmers.",
      image: "images/eye.png",
      details: "Create endless looks with this versatile 12-shade palette, featuring highly pigmented mattes and luminous shimmers. Blendable and buildable, perfect for both day and night makeup."
    },
    {
      id: 9,
      title: "Winter Jacket",
      category: "clothing",
      price: 149.99,
      description: "Warm and windproof winter jacket with a stylish design.",
      image: "images/jacket.png",
      details: "This insulated winter jacket combines function and fashion. It features a windproof outer shell, warm lining, detachable hood, and multiple zipped pockets. Ideal for cold climates."
    },
    {
      id: 10,
      title: "Sunglasses",
      category: "accessories",
      price: 89.99,
      description: "Designer sunglasses with UV protection and polarized lenses.",
      image: "images/Sun.png",
      details: "Elevate your look with these high-end sunglasses, featuring UV400 protection and polarized lenses to reduce glare. Lightweight frame design ensures comfort and durability all day long."
    }
  ];

let cartItems = [];

function getCartFromStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        const simpleCart = JSON.parse(storedCart);
        
        cartItems = [];
        
        simpleCart.forEach(item => {
            const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.totalPrice = existingItem.quantity * existingItem.price;
            } else {
                cartItems.push({
                    ...item,
                    quantity: 1,
                    totalPrice: item.price
                });
            }
        });
    }
    return cartItems;
}

function updateStorageFromCartItems() {
    let simpleCart = [];
    cartItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            simpleCart.push({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
                category: item.category
            });
        }
    });
    
    localStorage.setItem('cart', JSON.stringify(simpleCart));
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count-nav');
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function addToCart(product, quantity = 1) {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
    } else {
        cartItems.push({
            ...product,
            quantity: quantity,
            totalPrice: product.price * quantity
        });
    }
    
    updateStorageFromCartItems();
    updateCartCount();

    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toast-message");
    
    if (quantity === 1) {
        toastMessage.textContent = "Product added to cart!";
    } else {
        toastMessage.textContent = `${quantity} items added to cart!`;
    }
    
    toast.classList.add("active");
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'));
}

function displayProductDetails() {
  let cartItems = [];

  cartItems = getCartFromStorage();
    const productId = getProductIdFromUrl();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        window.location.href = 'shopping.html'; 
        return;
    }
    
    document.title = `${product.title} - Product Details`;
    
    const cartItem = cartItems.find(item => item.id === product.id);
    const currentQuantity = cartItem ? cartItem.quantity : 1;
    const productDetails = product.details || "No additional details available for this product.";
    const productDetailsElement = document.getElementById('product-details');
    productDetailsElement.innerHTML = `
        <div class="product-details-image">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="product-details-info">
            <h1 class="product-details-title">${product.title}</h1>
            <span class="product-details-category">${product.category}</span>
            <p class="product-details-price">$${product.price.toFixed(2)}</p>
            <div class="product-details-description">
                ${product.description}
                <p style="margin-top: 15px;">${productDetails}</p>
            </div>
            
            <!-- Quantity selector -->
            <div class="quantity-selector">
                <p>Quantité:</p>
                <div class="quantity-control">
                    <button class="quantity-btn minus-btn" id="decrease-quantity">-</button>
                    <input type="text" class="quantity-input" id="product-quantity" value="${currentQuantity}" readonly>
                    <button class="quantity-btn plus-btn" id="increase-quantity">+</button>
                </div>
            </div>
            
            <div class="product-actions-large">
                <button class="btn add-to-cart-detail" data-id="${product.id}">
                    ${cartItem ? 'Update Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    `;
    
    displayRelatedProducts(product);
    
    document.getElementById('decrease-quantity').addEventListener('click', function() {
        const quantityInput = document.getElementById('product-quantity');
        let quantity = parseInt(quantityInput.value);
        if (quantity > 1) {
            quantityInput.value = quantity - 1;
        }
    });
    
    document.getElementById('increase-quantity').addEventListener('click', function() {
        const quantityInput = document.getElementById('product-quantity');
        let quantity = parseInt(quantityInput.value);
        quantityInput.value = quantity + 1;
    });
    
    document.querySelector('.add-to-cart-detail').addEventListener('click', function() {
        const quantity = parseInt(document.getElementById('product-quantity').value);
        
        if (cartItem) {
            const index = cartItems.findIndex(item => item.id === product.id);
            if (index !== -1) {
                cartItems.splice(index, 1);
            }
        }
        
        addToCart(product, quantity);
        
        this.textContent = 'Update Cart';
    });
}

function displayRelatedProducts(currentProduct) {
    const relatedProducts = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4); 
    
    const relatedProductsGrid = document.getElementById('related-products-grid');
    relatedProductsGrid.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const cartItem = cartItems.find(item => item.id === product.id);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-actions">
                    <button class="btn btn-sm ${cartItem ? 'btn-update' : 'add-to-cart'}" data-id="${product.id}">
                        ${cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                    </button>
                    <button class="btn-secondary btn-sm view-details" data-id="${product.id}">View Details</button>
                </div>
            </div>
        `;
        
        relatedProductsGrid.appendChild(productCard);
    });
    
    relatedProductsGrid.querySelectorAll('.add-to-cart, .btn-update').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const product = products.find(p => p.id === productId);
            
            const cartItem = cartItems.find(item => item.id === product.id);
            
            if (cartItem) {
                cartItem.quantity += 1;
                cartItem.totalPrice = cartItem.price * cartItem.quantity;
                updateStorageFromCartItems();
                updateCartCount();
                
                this.textContent = `In Cart (${cartItem.quantity})`;
                this.classList.add('btn-update');
                this.classList.remove('add-to-cart');
            } else {
                addToCart(product);
                
                this.textContent = 'In Cart (1)';
                this.classList.add('btn-update');
                this.classList.remove('add-to-cart');
            }
            
            const toast = document.getElementById("toast");
            const toastMessage = document.getElementById("toast-message");
            toastMessage.textContent = "Product added to cart!";
            toast.classList.add("active");
            setTimeout(() => {
                toast.classList.remove("active");
            }, 3000);
        });
    });
    
    relatedProductsGrid.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            window.location.href = `productDetails.html?id=${productId}`;
        });
    });
}

window.addEventListener('DOMContentLoaded', function() {
    getCartFromStorage();
    displayProductDetails();
    updateCartCount();
});

function showQuickview(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const cartItem = cartItems.find(item => item.id === product.id);
    
    const quickviewContent = document.getElementById('quickview-content');
    quickviewContent.innerHTML = `
        <div class="quickview-image">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="quickview-info">
            <h2 class="quickview-title">${product.title}</h2>
            <span class="quickview-category">${product.category}</span>
            <p class="quickview-price">$${product.price.toFixed(2)}</p>
            <div class="quickview-description">
                ${product.description}
            </div>
            <div class="quickview-actions">
                <button class="btn add-to-cart-quickview" data-id="${product.id}">
                    ${cartItem ? `In Cart (${cartItem.quantity})` : 'Add to Cart'}
                </button>
                <a href="productDetails.html?id=${product.id}" class="btn-secondary" style="text-decoration: none; font-weight: bold;">View Details</a>
            </div>
        </div>
    `;
    
    const quickviewModal = document.getElementById('product-quickview');
    quickviewModal.style.display = 'block';
    
    document.body.style.overflow = 'hidden';
    
    document.querySelector('.add-to-cart-quickview').addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);
        
        const cartItem = cartItems.find(item => item.id === product.id);
        
        if (cartItem) {
            cartItem.quantity += 1;
            cartItem.totalPrice = cartItem.price * cartItem.quantity;
            updateStorageFromCartItems();
            updateCartCount();
            
            this.textContent = `In Cart (${cartItem.quantity})`;
        } else {
            addToCart(product);
            
            this.textContent = 'In Cart (1)';
        }
        
        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toast-message");
        toastMessage.textContent = "Product added to cart!";
        toast.classList.add("active");
        setTimeout(() => {
            toast.classList.remove("active");
        }, 3000);
    });
}

function closeQuickview() {
    const quickviewModal = document.getElementById('product-quickview');
    quickviewModal.style.display = 'none';
    
    document.body.style.overflow = '';
}

window.addEventListener('DOMContentLoaded', function() {
    getCartFromStorage();
    updateCartCount();
    
    displayProductDetails();
    
    document.querySelector('.close-quickview').addEventListener('click', closeQuickview);
    
    window.addEventListener('click', function(event) {
        const quickviewModal = document.getElementById('product-quickview');
        if (event.target === quickviewModal) {
            closeQuickview();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeQuickview();
        }
    });
    
    const originalDisplayRelatedProducts = displayRelatedProducts;
    
    displayRelatedProducts = function(currentProduct) {
        originalDisplayRelatedProducts(currentProduct);
        
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            card.addEventListener('click', function(e) {
                
                const isButton = e.target.tagName === 'BUTTON' || 
                                e.target.closest('button') || 
                                e.target.tagName === 'A' ||
                                e.target.closest('a') ||
                                e.target.closest('.product-actions');
                
                if (!isButton) {
                    
                    const viewDetailsBtn = this.querySelector('.view-details');
                    if (viewDetailsBtn) {
                        const productId = parseInt(viewDetailsBtn.getAttribute('data-id'));
                        e.preventDefault();
                        e.stopPropagation();
                        showQuickview(productId);
                    }
                }
            });
        });
    };
    
    const productId = getProductIdFromUrl();
    const product = products.find(p => p.id === productId);
    if (product) {
        displayRelatedProducts(product);
    }
});