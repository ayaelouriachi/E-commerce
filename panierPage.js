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

function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count-nav');
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCountElement.textContent = totalItems;
}

function displayCart() {
    const cartContent = document.getElementById('cart-content');
    
    if (cartItems.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Discover our products and add them to your cart</p>
                <a href="shopping.html#products" class="btn">Browse products</a>
            </div>
        `;
        return;
    }
    
    let subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const total = subtotal + shipping;
    
    let cartHTML = `
        <table class="cart-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add available stock check
    let hasStockIssue = false;
    
    cartItems.forEach(item => {
        // Check available stock
        const productStock = getProductStock(item.id);
        const stockClass = productStock < item.quantity ? 'stock-warning' : '';
        if (productStock < item.quantity) {
            hasStockIssue = true;
        }
        
        cartHTML += `
            <tr class="${stockClass}">
                <td>
                    <div class="cart-product">
                        <img src="${item.image}" alt="${item.title}">
                        <div class="cart-product-info">
                            <h3>${item.title}</h3>
                            <span class="product-category">${item.category}</span>
                            ${productStock < item.quantity ? 
                              `<div class="stock-warning-message">Available stock: ${productStock}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="price">$${item.price.toFixed(2)}</td>
                <td>
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                        <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                        <button class="quantity-btn plus-btn" data-id="${item.id}" ${productStock <= item.quantity ? 'disabled' : ''}>+</button>
                    </div>
                </td>
                <td class="price">$${item.totalPrice.toFixed(2)}</td>
                <td>
                    <button class="remove-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    cartHTML += `
            </tbody>
        </table>
        
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping fees</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="stock-error" id="stock-error">
            Some products don't have sufficient stock. Please adjust quantities.
        </div>
        
        <button class="checkout-btn" ${hasStockIssue ? 'disabled' : ''}>Proceed to checkout</button>
        <a href="shopping.html#products" class="continue-shopping">Continue shopping</a>
    `;
    
    cartContent.innerHTML = cartHTML;
    
    // Display error message if needed
    const stockError = document.getElementById('stock-error');
    if (hasStockIssue && stockError) {
        stockError.classList.add('visible');
    }

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            removeFromCart(productId);
        });
    });
    
    document.querySelectorAll('.minus-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            updateQuantity(productId, 'decrease');
        });
    });
    
    document.querySelectorAll('.plus-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-id'));
            const productStock = getProductStock(productId);
            const cartItem = cartItems.find(item => item.id === productId);
            
            if (cartItem && productStock > cartItem.quantity) {
                updateQuantity(productId, 'increase');
            } else {
                // Display alert message for insufficient stock
                showToast("Insufficient stock for this product", "error");
            }
        });
    });
    
    // Update checkout function to decrement stock
    document.querySelector('.checkout-btn').addEventListener('click', function() {
        if (!hasStockIssue) {
            processCheckout();
        }
    });
}

// New function to get product stock
function getProductStock(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
}

// New function to decrement stock at checkout
function processCheckout() {
    // Get products
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let stockUpdated = false;
    
    // Decrement stock for each cart item
    cartItems.forEach(cartItem => {
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            // Ensure stock doesn't become negative
            if (products[productIndex].stock >= cartItem.quantity) {
                products[productIndex].stock -= cartItem.quantity;
                stockUpdated = true;
            }
        }
    });
    
    // Update localStorage if stocks have been modified
    if (stockUpdated) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Empty the cart
    cartItems = [];
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    // Display confirmation message and redirect
    showToast("Order processed successfully!", "success");
    
    // Display confirmation message
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = `
        <div class="checkout-success">
            <i class="fas fa-check-circle"></i>
            <h2>Order confirmed!</h2>
            <p>Thank you for your purchase. Your order has been processed successfully.</p>
            <a href="shopping.html" class="btn">Return to shop</a>
        </div>
    `;
}

function removeFromCart(productId) {
    const index = cartItems.findIndex(item => item.id === productId);
    if (index !== -1) {
        cartItems.splice(index, 1);
        
        updateStorageFromCartItems();
        
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.textContent = "Product removed from cart!";
        toast.classList.add("active");
        setTimeout(() => {
            toast.classList.remove("active");
        }, 3000);
        
        updateCartCount();
        displayCart();
    }
}

function updateQuantity(productId, action) {
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        if (action === 'increase') {
            // Check available stock before increasing quantity
            const productStock = getProductStock(productId);
            if (productStock > cartItems[itemIndex].quantity) {
                cartItems[itemIndex].quantity += 1;
            } else {
                showToast("Insufficient stock for this product", "error");
                return;
            }
        } else if (action === 'decrease' && cartItems[itemIndex].quantity > 1) {
            cartItems[itemIndex].quantity -= 1;
        }
        
        cartItems[itemIndex].totalPrice = cartItems[itemIndex].price * cartItems[itemIndex].quantity;
        
        updateStorageFromCartItems();
        
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.textContent = "Quantity updated!";
        toast.classList.add("active");
        setTimeout(() => {
            toast.classList.remove("active");
        }, 3000);
        
        updateCartCount();
        displayCart();
    }
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

// Function to display toast messages
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, duration);
}

window.addEventListener('DOMContentLoaded', function() {
    getCartFromStorage();
    updateCartCount();
    displayCart();
});