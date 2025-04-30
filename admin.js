import { initProducts } from './products.js';

// Initialiser les produits
let products = initProducts();
  
  // If products don't exist in localStorage, initialize them
  if (!localStorage.getItem('products')) {
    // S'assurer que les produits par défaut ont tous les champs requis
    products.forEach(product => {
      if (!product.details) {
        product.details = "Detailed information about this product will be available soon.";
      }
      if (product.stock === undefined) {
        product.stock = 20; // Valeur par défaut pour le stock
      }
    });
    localStorage.setItem('products', JSON.stringify(products));
  }
  
  // Get cart items for the cart count
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // DOM Elements
  const productsList = document.getElementById('products-list');
  const productForm = document.getElementById('product-form');
  const productSearch = document.getElementById('product-search');
  const categoryFilter = document.getElementById('category-filter');
  const sortProducts = document.getElementById('sort-products');
  const cancelBtn = document.getElementById('cancel-btn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const confirmDeleteModal = document.getElementById('confirm-delete-modal');
  const cancelDelete = document.getElementById('cancel-delete');
  const confirmDelete = document.getElementById('confirm-delete');
  const productCount = document.getElementById('product-count');
  
  // Variables for editing/deleting
  let currentProductId = null;
  let productToDelete = null;
  
  // Initialize tabs
  document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();
    
    // Initialize tabs
    initTabs();
    
    // Load products
    loadProducts();
    
    // Update product count in stats
    updateProductCount();
    
    // Event listeners
    setupEventListeners();
    
    // Update category stats
    updateCategoryStats();
    
    // Update categories list
    updateCategoriesList();
    
    // Image preview
    setupImagePreview();
  });
  
  // Initialize admin tabs
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.admin-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        // Reset form if switching to add product tab
        if (tab === 'add-product') {
          resetProductForm();
        }
      });
    });
  }
  
  // Load products into the admin table
  function loadProducts(filter = 'all', sort = 'default', searchTerm = '') {
    // Get the latest products from localStorage
    products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Filter products
    let filteredProducts = products;
    
    if (filter !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === filter);
    }
    
    // Search products
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort products
    switch (sort) {
      case 'name-asc':
        filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
    }
    
    // Clear existing products
    productsList.innerHTML = '';
    
    // Generate HTML for each product
    filteredProducts.forEach(product => {
      const stockClass = product.stock <= 5 ? 'low-stock' : '';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <img src="${product.image}" alt="${product.title}" class="product-thumb">
        </td>
        <td>${product.title}</td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
         <td class="${stockClass}">${product.stock}</td>
        <td>
          <button class="btn-icon edit-product" data-id="${product.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete-product" data-id="${product.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      productsList.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-product').forEach(button => {
      button.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        editProduct(productId);
      });
    });
    
    document.querySelectorAll('.delete-product').forEach(button => {
      button.addEventListener('click', function() {
        const productId = parseInt(this.getAttribute('data-id'));
        showDeleteConfirmation(productId);
      });
    });
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Product search
    productSearch.addEventListener('input', function() {
      const searchTerm = this.value;
      const filter = categoryFilter.value;
      const sort = sortProducts.value;
      loadProducts(filter, sort, searchTerm);
    });
    
    // Category filter
    categoryFilter.addEventListener('change', function() {
      const filter = this.value;
      const searchTerm = productSearch.value;
      const sort = sortProducts.value;
      loadProducts(filter, sort, searchTerm);
    });
    
    // Sort products
    sortProducts.addEventListener('change', function() {
      const sort = this.value;
      const filter = categoryFilter.value;
      const searchTerm = productSearch.value;
      loadProducts(filter, sort, searchTerm);
    });
    
    // Cancel button
    cancelBtn.addEventListener('click', function() {
      resetProductForm();
    });
    
    // Product form submit
    productForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveProduct();
    });
    
    // Settings form submit
    document.getElementById('settings-form').addEventListener('submit', function(e) {
      e.preventDefault();
      saveSettings();
    });
    
    // Category form submit
    document.getElementById('category-form').addEventListener('submit', function(e) {
      e.preventDefault();
      addCategory();
    });
    
    // Delete confirmation
    cancelDelete.addEventListener('click', function() {
      confirmDeleteModal.classList.remove('active');
    });
    
    confirmDelete.addEventListener('click', function() {
      if (productToDelete !== null) {
        deleteProduct(productToDelete);
        confirmDeleteModal.classList.remove('active');
      }
    });
  }
  
  // Image preview
  function setupImagePreview() {
    const productImage = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    productImage.addEventListener('input', function() {
      const imageUrl = this.value;
      if (imageUrl) {
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
      } else {
        imagePreview.style.display = 'none';
      }
    });
  }
  
  // Edit product
  function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Switch to add product tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="add-product"]').classList.add('active');
    document.getElementById('add-product-tab').classList.add('active');
    
    // Fill form with product data
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-details').value = product.details || '';
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-stock').value = product.stock || 0; 
    
    // Show image preview
    const imagePreview = document.getElementById('image-preview');
    imagePreview.src = product.image;
    imagePreview.style.display = 'block';
    
    // Set current product ID
    currentProductId = productId;
  }
  
  // Reset product form
  function resetProductForm() {
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
    productForm.reset();
    document.getElementById('image-preview').style.display = 'none';
    currentProductId = null;
  }
  
  // Save product (add new or update existing)
  function saveProduct() {
    const productId = document.getElementById('product-id').value;
    const title = document.getElementById('product-title').value;
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value;
    const details = document.getElementById('product-details').value;
    const image = document.getElementById('product-image').value;
    const stock = parseInt(document.getElementById('product-stock').value) || 0;
    
    if (!title || !category || isNaN(price) || price <= 0 || !description || !image || isNaN(stock) || stock < 0) {
      showToast('Please fill all fields correctly', 'error');
      return;
    }
    
    if (productId) {
      // Update existing product
      const index = products.findIndex(p => p.id === parseInt(productId));
      if (index !== -1) {
        products[index] = {
          ...products[index],
          title,
          category,
          price,
          description,
          details,
          image,
          stock
        };
        
        // Update localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        // Update cart if product is in cart
        updateCartWithUpdatedProduct(parseInt(productId), {
          title, category, price, image
        });
        
        showToast('Product updated successfully');
      }
    } else {
      // Add new product
      const newId = getNewProductId();
      const newProduct = {
        id: newId,
        title,
        category,
        price,
        description,
        details,
        image,
        stock
      };
      
      products.push(newProduct);
      
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(products));
      
      showToast('Product added successfully');
    }
    
    // Reset form and reload products
    resetProductForm();
    loadProducts();
    updateProductCount();
    
    // Switch back to products tab
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    document.querySelector('.tab-btn[data-tab="products"]').classList.add('active');
    document.getElementById('products-tab').classList.add('active');
  }
  
  // Get new product ID
  function getNewProductId() {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
  }
  
  // Show delete confirmation
  function showDeleteConfirmation(productId) {
    productToDelete = productId;
    confirmDeleteModal.classList.add('active');
  }
  
  // Delete product
  function deleteProduct(productId) {
    // Remove from products array
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products.splice(index, 1);
      
      // Update localStorage
      localStorage.setItem('products', JSON.stringify(products));
      
      // Remove from cart
      removeProductFromCart(productId);
      
      // Reload products
      loadProducts();
      updateProductCount();
      
      showToast('Product deleted successfully');
    }
  }
  
  // Update product count
  function updateProductCount() {
    productCount.textContent = products.length;
  }
  
  // Update cart with updated product
  function updateCartWithUpdatedProduct(productId, updatedFields) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let updated = false;
    
    // Update all instances of the product in the cart
    cart.forEach(item => {
      if (item.id === productId) {
        Object.assign(item, updatedFields);
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
  
  // Remove product from cart
  function removeProductFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Filter out the deleted product
    cart = cart.filter(item => item.id !== productId);
    
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
  }
  
  // Update cart count
  function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count-nav');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartCountElement.textContent = cart.length;
  }
  
  // Show toast message
  function showToast(message, type = 'success', duration = 3000) {
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
  
  // Save settings
  function saveSettings() {
    const storeName = document.getElementById('store-name').value;
    const storeEmail = document.getElementById('store-email').value;
    const storePhone = document.getElementById('store-phone').value;
    const storeCurrency = document.getElementById('store-currency').value;
    
    // Save settings to localStorage
    const settings = {
      storeName,
      storeEmail,
      storePhone,
      storeCurrency
    };
    
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    
    showToast('Settings saved successfully');
  }
  
  // Add category
  function addCategory() {
    const categoryName = document.getElementById('category-name').value;
    const categoryImage = document.getElementById('category-image').value; 
    if (!categoryName || !categoryImage) {
      showToast('Please enter both category name and image URL', 'error');
      return;
    }
    
    // Get categories from localStorage or use default ones
    const defaultCategories = [
      { name: 'clothing', image: 'category1.png' },
      { name: 'makeup', image: 'category3.png' },
      { name: 'accessories', image: 'category2.png' }
    ];
    let categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
    
    // Check if category already exists
    if (categories.some(cat => cat.name === categoryName)) {
      showToast('Category already exists', 'error');
      return;
    }
    
    // Add new category
    categories.push({
      name: categoryName,
      image: categoryImage
    });
    
    // Update localStorage
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Update categories list
    updateCategoriesList();
    updateCategoryOptions();
    
    // // Add option to category select in product form
    // const option = document.createElement('option');
    // option.value = categoryName;
    // option.textContent = categoryName;
    // document.getElementById('product-category').appendChild(option);
    
    // // Add option to category filter
    // const filterOption = document.createElement('option');
    // filterOption.value = categoryName;
    // filterOption.textContent = categoryName;
    // categoryFilter.appendChild(filterOption);
    
    // Reset form and show toast
    document.getElementById('category-form').reset();
    showToast('Category added successfully');
    updateCategoryStats();
  }
  function updateCategoryStats() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryStats = document.getElementById('category-stats');
    
    categoryStats.innerHTML = `
      <div class="stat-card">
                <i class="fas fa-tags"></i>
                <h3>Categories</h3>
                <p class="stat-number">${categories.length}</p>
    `;
  }
  // Update categories list
 
  
  // Initialize when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Load store settings if they exist
    const settings = JSON.parse(localStorage.getItem('storeSettings'));
    if (settings) {
      document.getElementById('store-name').value = settings.storeName;
      document.getElementById('store-email').value = settings.storeEmail;
      document.getElementById('store-phone').value = settings.storePhone;
      document.getElementById('store-currency').value = settings.storeCurrency;
    } 
    if (!localStorage.getItem('products')) {
      // Assurons-nous que les produits par défaut ont tous le champ details
      products.forEach(product => {
        if (!product.details) {
          product.details = "Detailed information about this product will be available soon.";
        }
      });
      localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Update categories list
    updateCategoriesList();
  });
  // Ajouter ces fonctions dans admin.js pour gérer les actions des catégories

// Fonction pour mettre à jour la liste des catégories
function updateCategoriesList() {
  const categoriesList = document.getElementById('categories-list');
  const defaultCategories = [
    { name: 'clothing', image: 'category1.png' },
    { name: 'makeup', image: 'category3.png' },
    { name: 'accessories', image: 'category2.png' }
  ];
  const categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
  
  categoriesList.innerHTML = '';
  
  categories.forEach(category => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${category.name}</span>  
      <div class="category-actions">
        <button class="btn-icon edit-category" data-category="${category.name}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-icon delete-category" data-category="${category.name}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    
    categoriesList.appendChild(li);
  });
  
  addCategoryEventListeners();
}
  // Ajouter les écouteurs d'événements pour les boutons d'édition et de suppression
  function addCategoryEventListeners() {
    // Listeners for category editing
    document.querySelectorAll('.edit-category').forEach(button => {
      button.addEventListener('click', function() {
        const categoryName = this.getAttribute('data-category');
        showEditCategoryForm(categoryName);
      });
    });
    
    // Listeners for category deletion
    document.querySelectorAll('.delete-category').forEach(button => {
      button.addEventListener('click', function() {
        const categoryName = this.getAttribute('data-category');
        showDeleteCategoryConfirmation(categoryName);
      });
    });
  }
  
  // Afficher le formulaire d'édition de catégorie
  function showEditCategoryForm(categoryName) {
    // Créer une div pour le modal d'édition s'il n'existe pas déjà
    if (!document.getElementById('edit-category-modal')) {
      const modal = document.createElement('div');
      modal.id = 'edit-category-modal';
      modal.className = 'confirm-modal';
      modal.innerHTML = `
        <div class="confirm-modal-content">
          <h3>Edit Category</h3>
          <form id="edit-category-form">
            <div class="form-group">
              <label for="edit-category-name">Category Name</label>
              <input type="text" id="edit-category-name" required>
              <input type="hidden" id="original-category-name">
            </div>
            <div class="confirm-actions">
              <button type="button" id="cancel-edit-category" class="btn-secondary">Cancel</button>
              <button type="submit" class="btn">Save Changes</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Ajouter des écouteurs d'événements pour le formulaire d'édition
      document.getElementById('cancel-edit-category').addEventListener('click', function() {
        document.getElementById('edit-category-modal').classList.remove('active');
      });
      
      document.getElementById('edit-category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const newCategoryName = document.getElementById('edit-category-name').value;
        const originalCategoryName = document.getElementById('original-category-name').value;
        updateCategory(originalCategoryName, newCategoryName);
        document.getElementById('edit-category-modal').classList.remove('active');
      });
    }
    
    // Remplir le formulaire avec la catégorie existante
    document.getElementById('edit-category-name').value = categoryName;
    document.getElementById('original-category-name').value = categoryName;
    
    // Afficher le modal
    document.getElementById('edit-category-modal').classList.add('active');
  }
  
  // Mettre à jour une catégorie
  function updateCategory(oldName, newName) {
    if (oldName === newName) return;
    
    // Obtenir les catégories depuis localStorage
    const defaultCategories = [
      { name: 'clothing', image: 'category1.png' },
      { name: 'makeup', image: 'category3.png' },
      { name: 'accessories', image: 'category2.png' }
    ];
    let categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
    
    // Vérifier si la nouvelle catégorie existe déjà
    if (categories.some(cat => cat.name === newName)) {
      showToast('Category name already exists', 'error');
      return;
    }
    // Mettre à jour la catégorie
    const index = categories.findIndex(cat => cat.name === oldName);
    if (index !== -1) {
      categories[index].name = newName;
      
      // Mettre à jour localStorage
      localStorage.setItem('categories', JSON.stringify(categories));
      
      // Mettre à jour tous les produits avec cette catégorie
      updateProductsCategory(oldName, newName);
      
      // Mettre à jour l'interface utilisateur
      updateCategoriesList();
      updateCategoryOptions();
      updateCategoryStats();
      
      showToast('Category updated successfully');
    }
  }
  
  // Mettre à jour la catégorie des produits
  function updateProductsCategory(oldCategory, newCategory) {
    // Obtenir les produits depuis localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Mettre à jour les produits qui utilisent l'ancienne catégorie
    let updated = false;
    products.forEach(product => {
      if (product.category === oldCategory) {
        product.category = newCategory;
        updated = true;
      }
    });
    
    // Mettre à jour localStorage si des produits ont été modifiés
    if (updated) {
      localStorage.setItem('products', JSON.stringify(products));
      loadProducts(); // Recharger la liste des produits
    }
  }
  
  // Afficher la confirmation de suppression de catégorie
  function showDeleteCategoryConfirmation(categoryName) {
    // Créer une div pour le modal de confirmation s'il n'existe pas déjà
    if (!document.getElementById('delete-category-modal')) {
      const modal = document.createElement('div');
      modal.id = 'delete-category-modal';
      modal.className = 'confirm-modal';
      modal.innerHTML = `
        <div class="confirm-modal-content">
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this category? All products in this category will be moved to "uncategorized".</p>
          <div class="confirm-actions">
            <button id="cancel-delete-category" class="btn-secondary">Cancel</button>
            <button id="confirm-delete-category" class="btn-delete">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Ajouter des écouteurs d'événements pour la confirmation de suppression
      document.getElementById('cancel-delete-category').addEventListener('click', function() {
        document.getElementById('delete-category-modal').classList.remove('active');
      });
    }
    
    // Mettre à jour l'écouteur d'événement pour la suppression avec la catégorie correcte
    const confirmDeleteButton = document.getElementById('confirm-delete-category');
    confirmDeleteButton.setAttribute('data-category', categoryName);
    confirmDeleteButton.onclick = function() {
      const categoryToDelete = this.getAttribute('data-category');
      deleteCategory(categoryToDelete);
      document.getElementById('delete-category-modal').classList.remove('active');
    };
    
    // Afficher le modal
    document.getElementById('delete-category-modal').classList.add('active');
  }
  
  // Supprimer une catégorie
  function deleteCategory(categoryName) {
    // Ne pas supprimer les catégories par défaut
    const defaultCategories = ['clothing', 'makeup', 'accessories'];
    if (defaultCategories.includes(categoryName)) {
      showToast('Cannot delete default categories', 'error');
      return;
    }
    
    // Obtenir les catégories depuis localStorage
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    // Supprimer la catégorie
    const index = categories.findIndex(cat => cat.name === categoryName);
    if (index !== -1) {
      categories.splice(index, 1);
      
      // Mettre à jour localStorage
      localStorage.setItem('categories', JSON.stringify(categories));
      
      // Mettre à jour tous les produits avec cette catégorie
      updateProductsCategory(categoryName, 'uncategorized');
      
      // Mettre à jour l'interface utilisateur
      updateCategoriesList();
      updateCategoryOptions();
      updateCategoryStats();
      
      showToast('Category deleted successfully');
    }
  }
  
  // Mettre à jour les options de catégorie dans les formulaires
  function updateCategoryOptions() {
    const defaultCategories = [
      { name: 'clothing', image: 'category1.png' },
      { name: 'makeup', image: 'category3.png' },
      { name: 'accessories', image: 'category2.png' }
    ];
    const categories = JSON.parse(localStorage.getItem('categories')) || defaultCategories;
    
    // Mettre à jour le sélecteur de catégorie dans le formulaire de produit
    const productCategorySelect = document.getElementById('product-category');
    if (productCategorySelect) {
      // Conserver l'option actuellement sélectionnée
      const selectedCategory = productCategorySelect.value;
      
      // Effacer toutes les options sauf la première (placeholder)
      while (productCategorySelect.options.length > 1) {
        productCategorySelect.remove(1);
      }
      
      // Ajouter les nouvelles options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        productCategorySelect.appendChild(option);
      });
      
      // Restaurer la sélection précédente si possible
      if (selectedCategory && categories.some(cat => cat.name === selectedCategory)) {
        productCategorySelect.value = selectedCategory;
      }
    }
    
    // Mettre à jour le sélecteur de filtrage de catégorie
    const categoryFilterSelect = document.getElementById('category-filter');
    if (categoryFilterSelect) {
      // Conserver la catégorie actuellement sélectionnée
      const selectedFilter = categoryFilterSelect.value;
      
      // Effacer toutes les options sauf la première (All Categories)
      while (categoryFilterSelect.options.length > 1) {
        categoryFilterSelect.remove(1);
      }
      
      // Ajouter les nouvelles options
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        categoryFilterSelect.appendChild(option);
      });
      
      // Restaurer la sélection précédente si possible
      if (selectedFilter && (selectedFilter === 'all' || categories.some(cat => cat.name === selectedFilter))) {
        categoryFilterSelect.value = selectedFilter;
      } else {
        categoryFilterSelect.value = 'all';
      }
    }
  }
  
  // Modifier la fonction d'initialisation pour ajouter les écouteurs d'événements aux catégories
  document.addEventListener('DOMContentLoaded', function() {
    // Autres initialisations...
    
    // Appeler la fonction updateCategoriesList qui inclut maintenant addCategoryEventListeners
    updateCategoriesList();
    
    // Mettre à jour les options de catégorie
    updateCategoryOptions();
  });