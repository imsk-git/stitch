// Admin Dashboard JavaScript

const API_BASE = '/api';
let adminToken = null;
let adminCategories = [];

// Image preview function
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            // Store base64 in hidden field
            const hiddenId = previewId.replace('Preview', '');
            document.getElementById(hiddenId).value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    setupEventListeners();
});

// Check if admin is logged in
function checkAdminAuth() {
    adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (adminToken && adminUser) {
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.addEventListener('click', function() {
            switchSection(this.dataset.section);
        });
    });
    
    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // Category form
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Verify admin status by making a test request to admin endpoint
            const testResponse = await fetch(`${API_BASE}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });
            
            if (testResponse.ok) {
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                adminToken = data.token;
                showDashboard();
                loadDashboardData();
            } else {
                showLoginError('Access denied. Admin privileges required.');
            }
        } else {
            showLoginError(data.message);
        }
    } catch (error) {
        showLoginError('Login failed. Please try again.');
    }
}

function showLoginError(message) {
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'flex';
    
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (adminUser) {
        document.getElementById('adminName').textContent = `Welcome, ${adminUser.name}`;
    }
}

function adminLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    adminToken = null;
    showLogin();
}

// Switch between sections
function switchSection(section) {
    // Update sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Update title
    const titles = {
        overview: 'Dashboard Overview',
        categories: 'Category Management',
        products: 'Product Management',
        orders: 'Order Management',
        users: 'User Management',
        messages: 'Messages'
    };
    document.getElementById('sectionTitle').textContent = titles[section];
    
    // Load section data
    switch(section) {
        case 'overview':
            loadStats();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'products':
            loadCategories(); // Load for dropdown
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'messages':
            loadMessages();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    loadStats();
    loadCategories();
    loadUnreadCount();
}

// API Helper
async function adminFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
            ...options.headers
        }
    });
    return response;
}

// ==================== STATS ====================

async function loadStats() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/stats`);
        const stats = await response.json();
        
        document.getElementById('statProducts').textContent = stats.totalProducts;
        document.getElementById('statOrders').textContent = stats.totalOrders;
        document.getElementById('statUsers').textContent = stats.totalUsers;
        document.getElementById('statRevenue').textContent = `₹${stats.totalRevenue.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ==================== CATEGORIES ====================

async function loadCategories() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/categories`);
        adminCategories = await response.json();
        displayCategories();
        updateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    adminCategories.forEach(category => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${category.image || 'https://via.placeholder.com/50'}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/50'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
            <td><strong>${category.name}</strong></td>
            <td>${category.description || '-'}</td>
            <td><span class="badge bg-secondary">-</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="editCategory('${category._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteCategory('${category._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = '';
    adminCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryImage').value = '';
    document.getElementById('categoryImagePreview').style.display = 'none';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

async function editCategory(categoryId) {
    const category = adminCategories.find(c => c._id === categoryId);
    if (!category) return;
    
    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryId').value = category._id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryDescription').value = category.description || '';
    document.getElementById('categoryImage').value = category.image || '';
    
    // Show existing image preview
    const preview = document.getElementById('categoryImagePreview');
    if (category.image) {
        preview.src = category.image;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
    
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        image: document.getElementById('categoryImage').value
    };
    
    try {
        const url = categoryId 
            ? `${API_BASE}/admin/categories/${categoryId}`
            : `${API_BASE}/admin/categories`;
        
        const method = categoryId ? 'PUT' : 'POST';
        
        const response = await adminFetch(url, {
            method,
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
            loadCategories();
            loadStats();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to save category');
        }
    } catch (error) {
        console.error('Error saving category:', error);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const response = await adminFetch(`${API_BASE}/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCategories();
            loadStats();
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
    }
}

// ==================== PRODUCTS ====================

async function loadProducts() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/products`);
        const products = await response.json();
        
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        
        products.forEach(product => {
            const categoryName = product.category?.name || 'Uncategorized';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                <td>${product.name}</td>
                <td><span class="badge bg-info">${categoryName}</span></td>
                <td>₹${product.price}</td>
                <td>
                    <span class="badge ${product.inStock ? 'bg-success' : 'bg-danger'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="editProduct('${product._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-action" onclick="deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function showAddProductModal() {
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productImagePreview').style.display = 'none';
    document.getElementById('productInStock').checked = true;
    loadCategories();
    new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productCategory').value = product.category?._id || product.category;
        document.getElementById('productInStock').checked = product.inStock;
        
        // Show existing image preview
        const preview = document.getElementById('productImagePreview');
        if (product.image) {
            preview.src = product.image;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
        
        new bootstrap.Modal(document.getElementById('productModal')).show();
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        category: document.getElementById('productCategory').value,
        inStock: document.getElementById('productInStock').checked
    };
    
    try {
        const url = productId 
            ? `${API_BASE}/admin/products/${productId}`
            : `${API_BASE}/admin/products`;
        
        const method = productId ? 'PUT' : 'POST';
        
        const response = await adminFetch(url, {
            method,
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            loadProducts();
            loadStats();
        } else {
            alert('Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await adminFetch(`${API_BASE}/admin/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProducts();
            loadStats();
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// ==================== ORDERS ====================

async function loadOrders() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/orders`);
        const orders = await response.json();
        
        const tbody = document.getElementById('ordersTableBody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString();
            const statusColors = {
                'Placed': 'bg-primary',
                'Processing': 'bg-warning',
                'Shipped': 'bg-info',
                'Delivered': 'bg-success',
                'Cancelled': 'bg-danger'
            };
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${order._id.slice(-6).toUpperCase()}</td>
                <td>${order.customerInfo?.name || order.userId?.name || 'N/A'}</td>
                <td>${order.items.length} item(s)</td>
                <td>₹${order.totalAmount}</td>
                <td><span class="badge ${statusColors[order.status] || 'bg-secondary'}">${order.status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-action" onclick="showOrderStatusModal('${order._id}', '${order.status}')">
                        <i class="fas fa-edit"></i> Status
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function showOrderStatusModal(orderId, currentStatus) {
    document.getElementById('orderId').value = orderId;
    document.getElementById('orderStatus').value = currentStatus;
    new bootstrap.Modal(document.getElementById('orderStatusModal')).show();
}

async function updateOrderStatus() {
    const orderId = document.getElementById('orderId').value;
    const status = document.getElementById('orderStatus').value;
    
    try {
        const response = await adminFetch(`${API_BASE}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('orderStatusModal')).hide();
            loadOrders();
        } else {
            alert('Failed to update order status');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// ==================== USERS ====================

async function loadUsers() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/users`);
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const date = new Date(user.createdAt).toLocaleDateString();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${date}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// ==================== MESSAGES ====================

// Load unread message count
async function loadUnreadCount() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/messages/unread-count`);
        const data = await response.json();
        
        const badge = document.getElementById('unreadBadge');
        if (data.count > 0) {
            badge.textContent = data.count;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading unread count:', error);
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await adminFetch(`${API_BASE}/admin/messages`);
        const messages = await response.json();
        
        const tbody = document.getElementById('messagesTableBody');
        tbody.innerHTML = '';
        
        if (messages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No messages yet</td></tr>';
            return;
        }
        
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleString();
            const statusBadge = msg.isRead 
                ? '<span class="badge bg-secondary">Read</span>'
                : '<span class="badge bg-success">New</span>';
            
            const tr = document.createElement('tr');
            tr.className = msg.isRead ? '' : 'table-warning';
            tr.innerHTML = `
                <td>${statusBadge}</td>
                <td><strong>${msg.name}</strong></td>
                <td><a href="mailto:${msg.email}">${msg.email}</a></td>
                <td style="max-width: 300px;">${msg.message}</td>
                <td>${date}</td>
                <td>
                    ${!msg.isRead ? `<button class="btn btn-sm btn-outline-primary me-1" onclick="markAsRead('${msg._id}')"><i class="fas fa-check"></i></button>` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMessage('${msg._id}')"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Mark message as read
async function markAsRead(id) {
    try {
        await adminFetch(`${API_BASE}/admin/messages/${id}/read`, { method: 'PUT' });
        loadMessages();
        loadUnreadCount();
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Delete message
async function deleteMessage(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        await adminFetch(`${API_BASE}/admin/messages/${id}`, { method: 'DELETE' });
        loadMessages();
        loadUnreadCount();
    } catch (error) {
        console.error('Error deleting message:', error);
    }
}
