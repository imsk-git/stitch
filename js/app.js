// Global variables
let currentUser = null;
let cart = [];
let products = [];
let categories = [];
let orders = [];
let selectedCategory = 'all';

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load/refresh (disable browser scroll restoration)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    checkAuthStatus();
    loadCategories();
    loadProducts();
    setupEventListeners();
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        currentUser = JSON.parse(user);
        updateAuthUI();
        loadCart();
        loadOrders();
    }
}

// Update authentication UI
function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'block';
        userName.textContent = currentUser.name;
    } else {
        authButtons.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Checkout form
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Handle search
function handleSearch(e) {
    e.preventDefault();
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchQuery) {
        displayProducts(products);
        return;
    }
    
    // Filter products by name or description
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery)
    );
    
    // Show products section and scroll to it
    showSection('products');
    document.getElementById('productsSectionBadge').textContent = 'Search Results';
    document.getElementById('productsSectionTitle').textContent = `Results for "${searchQuery}"`;
    
    displayProducts(filteredProducts);
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/products/categories`);
        categories = await response.json();
        displayCategoryCards();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display category cards on landing page
function displayCategoryCards() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Default category images
    const categoryImages = {
        'Madhubani Painting': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
        'Embroidery': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop',
        'Hand Accessories': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        'Canvas Paintings': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        'Home Decor': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    };
    
    categories.forEach(category => {
        const imageUrl = category.image || categoryImages[category.name] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop';
        const productCount = products.filter(p => p.category && p.category._id === category._id).length;
        
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        col.innerHTML = `
            <div class="category-card" onclick="viewCategoryProducts('${category._id}', '${category.name}')">
                <div class="category-image-wrapper">
                    <img src="${imageUrl}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${category.name}'">
                    <div class="category-overlay">
                        <span class="view-products">View Products <i class="fas fa-arrow-right"></i></span>
                    </div>
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Explore our collection'}</p>
                    <span class="product-count">${productCount} Products</span>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// View products in a category
function viewCategoryProducts(categoryId, categoryName) {
    selectedCategory = categoryId;
    
    // Hide categories section, show products section
    document.getElementById('categories').style.display = 'none';
    document.getElementById('products').style.display = 'block';
    
    // Update products section header
    document.getElementById('productsSectionBadge').textContent = 'Category';
    document.getElementById('productsSectionTitle').textContent = categoryName;
    
    // Filter and display products
    const filtered = products.filter(p => p.category && p.category._id === categoryId);
    displayProducts(filtered);
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Show categories (back button)
function showCategories() {
    document.getElementById('products').style.display = 'none';
    document.getElementById('categories').style.display = 'block';
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        products = await response.json();
        // After loading products, update category cards with counts
        if (categories.length > 0) {
            displayCategoryCards();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Error loading products', 'danger');
    }
}

// Display products
function displayProducts(productsToDisplay = products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    
    if (productsToDisplay.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No products found matching your search.</p><button class="btn btn-primary" onclick="clearSearch()">Show All Products</button></div>';
        return;
    }
    
    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
}

// Search products
function handleSearch(e) {
    e.preventDefault();
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayProducts();
        return;
    }
    
    const filteredProducts = products.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });
    
    displayProducts(filteredProducts);
    
    // Scroll to products section
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Clear search and show all products
function clearSearch() {
    document.getElementById('searchInput').value = '';
    displayProducts();
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    
    const categoryName = product.category?.name || 'Uncategorized';
    
    col.innerHTML = `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x250?text=Product+Image'">
            <div class="card-body">
                <span class="product-category">${categoryName}</span>
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description.substring(0, 80)}${product.description.length > 80 ? '...' : ''}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <span class="product-price">₹${product.price.toLocaleString()}</span>
                    <button class="btn btn-primary" onclick="addToCart('${product._id}')">
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            updateAuthUI();
            loadCart();
            loadOrders();
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            showAlert('Login successful!', 'success');
        } else {
            // Show helpful message suggesting registration
            showAlert('Invalid credentials. Not registered yet? Please register first!', 'warning');
        }
    } catch (error) {
        showAlert('Login failed. Please try again.', 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Close register modal
            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
            
            // Clear the registration form
            document.getElementById('registerForm').reset();
            
            // Show success message and prompt to login
            showAlert('Registration successful! Please login with your credentials.', 'success');
            
            // Open login modal after a short delay
            setTimeout(() => {
                showLogin();
            }, 500);
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('Registration failed. Please try again.', 'danger');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    cart = [];
    orders = [];
    updateAuthUI();
    updateCartUI();
    updateOrdersUI();
    showAlert('Logged out successfully!', 'success');
}

// Google Registration (placeholder - needs OAuth setup)
function registerWithGoogle() {
    showAlert('Google Sign-In requires OAuth setup. Please register with email for now.', 'warning');
    // TODO: Implement Google OAuth
    // window.location.href = '/api/auth/google';
}

// Cart functions
async function addToCart(productId) {
    if (!currentUser) {
        showAlert('Please login to add items to cart', 'warning');
        showLogin();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ productId })
        });
        
        if (response.ok) {
            loadCart();
            showAlert('Item added to cart!', 'success');
        } else {
            showAlert('Failed to add item to cart', 'danger');
        }
    } catch (error) {
        showAlert('Error adding item to cart', 'danger');
    }
}

async function loadCart() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const cartData = await response.json();
        cart = cartData.items || [];
        updateCartUI();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            loadCart();
            showAlert('Item removed from cart', 'success');
        }
    } catch (error) {
        showAlert('Error removing item from cart', 'danger');
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    cartCount.textContent = cart.length;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        cartTotal.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.productId.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item d-flex align-items-center';
        cartItem.innerHTML = `
            <img src="${item.productId.image}" alt="${item.productId.name}" onerror="this.src='https://via.placeholder.com/80x80?text=Product'">
            <div class="flex-grow-1 ms-3">
                <h6 class="mb-1">${item.productId.name}</h6>
                <p class="mb-0 text-muted">₹${item.productId.price} x ${item.quantity}</p>
            </div>
            <div class="text-end">
                <strong>₹${itemTotal}</strong>
                <button class="btn btn-sm btn-outline-danger ms-2" onclick="removeFromCart('${item.productId._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total;
    checkoutBtn.disabled = false;
}

// Checkout
async function handleCheckout(e) {
    e.preventDefault();
    
    const customerInfo = {
        name: document.getElementById('checkoutName').value,
        email: document.getElementById('checkoutEmail').value,
        phone: document.getElementById('checkoutPhone').value,
        address: document.getElementById('checkoutAddress').value
    };
    
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'WhatsApp') {
        // Create WhatsApp message with order details
        const cartTotal = cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
        const itemsList = cart.map(item => 
            `• ${item.productId.name} (Qty: ${item.quantity}) - ₹${item.productId.price * item.quantity}`
        ).join('\n');
        
        const message = `🛒 *New Order from Stitch*\n\n` +
            `*Customer Details:*\n` +
            `Name: ${customerInfo.name}\n` +
            `Email: ${customerInfo.email}\n` +
            `Phone: ${customerInfo.phone}\n` +
            `Address: ${customerInfo.address}\n\n` +
            `*Order Items:*\n${itemsList}\n\n` +
            `*Total: ₹${cartTotal}*\n\n` +
            `Payment: Cash on Delivery`;
        
        // Open WhatsApp with the message (replace with your business number)
        const whatsappNumber = '919876543210'; // Replace with actual business number
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
        showAlert('Redirecting to WhatsApp to complete your order!', 'success');
        document.getElementById('checkoutForm').reset();
        return;
    }
    
    // COD - Place order in database
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ customerInfo, paymentMethod: 'COD' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            showAlert('Order placed successfully! Pay on delivery.', 'success');
            loadCart(); // Refresh cart (should be empty now)
            loadOrders(); // Refresh orders
            document.getElementById('checkoutForm').reset();
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('Error placing order', 'danger');
    }
}

// UI Helper functions
function showLogin() {
    new bootstrap.Modal(document.getElementById('loginModal')).show();
}

function showRegister() {
    new bootstrap.Modal(document.getElementById('registerModal')).show();
}

function showCart() {
    const cartSection = document.getElementById('cart');
    const ordersSection = document.getElementById('orders');
    
    // Hide orders section if visible
    ordersSection.style.display = 'none';
    
    cartSection.style.display = 'block';
    cartSection.scrollIntoView({ behavior: 'smooth' });
}

function showCheckout() {
    if (cart.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }
    
    // Pre-fill user info if available
    if (currentUser) {
        document.getElementById('checkoutName').value = currentUser.name;
        document.getElementById('checkoutEmail').value = currentUser.email;
    }
    
    new bootstrap.Modal(document.getElementById('checkoutModal')).show();
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}
// Orders functions
async function loadOrders() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            orders = await response.json();
            updateOrdersUI();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function updateOrdersUI() {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (!currentUser) {
        ordersContainer.innerHTML = '<p class="text-center text-muted">Please login to view your orders</p>';
        return;
    }
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-center text-muted">No orders found</p>';
        return;
    }
    
    ordersContainer.innerHTML = '';
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const orderCard = document.createElement('div');
        orderCard.className = 'card mb-3';
        orderCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Order #${order._id.slice(-6)}</h6>
                <div>
                    <span class="badge bg-success">${order.status}</span>
                    <small class="text-muted ms-2">${orderDate}</small>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h6>Items:</h6>
                        ${order.items.map(item => `
                            <div class="d-flex align-items-center mb-2">
                                <img src="${item.productId.image}" alt="${item.productId.name}" 
                                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"
                                     onerror="this.src='https://via.placeholder.com/50x50?text=Product'">
                                <div class="ms-3">
                                    <div class="fw-bold">${item.productId.name}</div>
                                    <small class="text-muted">Qty: ${item.quantity} × ₹${item.price}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="col-md-4">
                        <h6>Delivery Details:</h6>
                        <p class="mb-1"><strong>${order.customerInfo.name}</strong></p>
                        <p class="mb-1">${order.customerInfo.email}</p>
                        <p class="mb-1">${order.customerInfo.phone}</p>
                        <p class="mb-1">${order.customerInfo.address}</p>
                        <hr>
                        <h5 class="text-primary">Total: ₹${order.totalAmount}</h5>
                    </div>
                </div>
            </div>
        `;
        ordersContainer.appendChild(orderCard);
    });
}

function showOrders() {
    if (!currentUser) {
        showAlert('Please login to view orders', 'warning');
        showLogin();
        return;
    }
    
    const ordersSection = document.getElementById('orders');
    const cartSection = document.getElementById('cart');
    
    // Hide cart section if visible
    cartSection.style.display = 'none';
    
    ordersSection.style.display = 'block';
    ordersSection.scrollIntoView({ behavior: 'smooth' });
    
    loadOrders();
}

// Contact Form Handler
async function handleContactForm(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    try {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });
        
        if (response.ok) {
            // Show success message
            document.getElementById('contactForm').style.display = 'none';
            document.getElementById('contactSuccess').style.display = 'block';
            
            // Reset form after 5 seconds and show form again
            setTimeout(() => {
                document.getElementById('contactForm').reset();
                document.getElementById('contactForm').style.display = 'block';
                document.getElementById('contactSuccess').style.display = 'none';
            }, 5000);
        } else {
            showAlert('Failed to send message. Please try again.', 'danger');
        }
    } catch (error) {
        showAlert('Error sending message. Please try again.', 'danger');
    }
}