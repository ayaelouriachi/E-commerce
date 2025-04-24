
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
     
     cartItems.forEach(item => {
         cartHTML += `
             <tr>
                 <td>
                     <div class="cart-product">
                         <img src="${item.image}" alt="${item.title}">
                         <div class="cart-product-info">
                             <h3>${item.title}</h3>
                             <span class="product-category">${item.category}</span>
                         </div>
                     </div>
                 </td>
                 <td class="price">$${item.price.toFixed(2)}</td>
                 <td>
                     <div class="quantity-control">
                         <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                         <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                         <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
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
         
         <button class="checkout-btn">Passer à la caisse</button>
         <a href="shopping.html#products" class="continue-shopping">Continuer vos achats</a>
     `;
     
     cartContent.innerHTML = cartHTML;
     

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
             updateQuantity(productId, 'increase');
         });
     });
     
    
     document.querySelector('.checkout-btn').addEventListener('click', function() {
         alert('Fonctionnalité de paiement à implémenter');
     });
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
             cartItems[itemIndex].quantity += 1;
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
 

 window.addEventListener('DOMContentLoaded', function() {
     getCartFromStorage();
     updateCartCount();
     displayCart();
 });