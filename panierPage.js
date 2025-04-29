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
                <h2>Votre panier est vide</h2>
                <p>Découvrez nos produits et ajoutez-les à votre panier</p>
                <a href="shopping.html#products" class="btn">Parcourir les produits</a>
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
                    <th>Produit</th>
                    <th>Prix</th>
                    <th>Quantité</th>
                    <th>Total</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Ajouter une vérification du stock disponible
    let hasStockIssue = false;
    
    cartItems.forEach(item => {
        // Vérifier le stock disponible
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
                              `<div class="stock-warning-message">Stock disponible: ${productStock}</div>` : ''}
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
                <span>Sous-total</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Frais de livraison</span>
                <span>${shipping === 0 ? 'Gratuit' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        
        <div class="stock-error" id="stock-error">
            Certains produits n'ont pas de stock suffisant. Veuillez ajuster les quantités.
        </div>
        
        <button class="checkout-btn" ${hasStockIssue ? 'disabled' : ''}>Passer à la caisse</button>
        <a href="shopping.html#products" class="continue-shopping">Continuer vos achats</a>
    `;
    
    cartContent.innerHTML = cartHTML;
    
    // Afficher un message d'erreur si nécessaire
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
                // Afficher un message d'alerte pour stock insuffisant
                showToast("Stock insuffisant pour ce produit", "error");
            }
        });
    });
    
    // Mettre à jour la fonction de paiement pour décrémenter le stock
    document.querySelector('.checkout-btn').addEventListener('click', function() {
        if (!hasStockIssue) {
            processCheckout();
        }
    });
}

// Nouvelle fonction pour obtenir le stock d'un produit
function getProductStock(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
}

// Nouvelle fonction pour décrémenter le stock lors du paiement
function processCheckout() {
    // Récupération des produits
    const products = JSON.parse(localStorage.getItem('products')) || [];
    let stockUpdated = false;
    
    // Décrémenter le stock pour chaque article du panier
    cartItems.forEach(cartItem => {
        const productIndex = products.findIndex(p => p.id === cartItem.id);
        if (productIndex !== -1) {
            // S'assurer que le stock ne devient pas négatif
            if (products[productIndex].stock >= cartItem.quantity) {
                products[productIndex].stock -= cartItem.quantity;
                stockUpdated = true;
            }
        }
    });
    
    // Mettre à jour le localStorage si des stocks ont été modifiés
    if (stockUpdated) {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Vider le panier
    cartItems = [];
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
    
    // Afficher un message de confirmation et rediriger
    showToast("Commande traitée avec succès !", "success");
    
    // Afficher un message de confirmation
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = `
        <div class="checkout-success">
            <i class="fas fa-check-circle"></i>
            <h2>Commande validée !</h2>
            <p>Merci pour votre achat. Votre commande a été traitée avec succès.</p>
            <a href="shopping.html" class="btn">Retour à la boutique</a>
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
        toastMessage.textContent = "Produit retiré du panier!";
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
            // Vérifier le stock disponible avant d'augmenter la quantité
            const productStock = getProductStock(productId);
            if (productStock > cartItems[itemIndex].quantity) {
                cartItems[itemIndex].quantity += 1;
            } else {
                showToast("Stock insuffisant pour ce produit", "error");
                return;
            }
        } else if (action === 'decrease' && cartItems[itemIndex].quantity > 1) {
            cartItems[itemIndex].quantity -= 1;
        }
        
        cartItems[itemIndex].totalPrice = cartItems[itemIndex].price * cartItems[itemIndex].quantity;
        
        updateStorageFromCartItems();
        
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        toastMessage.textContent = "Quantité mise à jour!";
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

// Fonction pour afficher des messages toast
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