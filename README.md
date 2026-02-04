# Stitch - Handmade Embroidery & Painting E-Commerce

A single-page e-commerce web application for selling handmade embroidery and painting products by Mrs. Ranjula Kumari.

## Features

- **Single Page Application**: All features in one scrolling page
- **User Authentication**: Register, login, and logout functionality
- **Product Catalog**: Display handmade embroidery and painting products
- **Shopping Cart**: Add/remove items, persistent cart per user
- **Order Management**: Place orders and store in MongoDB
- **Responsive Design**: Mobile-friendly Bootstrap layout
- **Fixed Navigation**: Header and footer remain fixed while scrolling

## Technology Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5.3.0
- JavaScript (Vanilla)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Project Structure

```
Stitch/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── seedData.js
├── css/
│   └── style.css
├── js/
│   └── app.js
├── images/
├── index.html
├── package.json
├── .env
└── README.md
```

## Installation & Setup

### 1. Clone/Download the Project
```bash
cd Stitch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. MongoDB Atlas Setup
Follow the detailed guide in `MONGODB_SETUP.md` to:
- Create MongoDB Atlas account
- Set up cluster and database user
- Configure network access
- Get connection string

### 4. Environment Configuration
Update the `.env` file with your MongoDB Atlas credentials:
```env
MONGODB_URI=mongodb+srv://username:password@cluster-url/stitch?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 5. Seed Sample Data
```bash
npm run seed
```

### 6. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

### Cart (Protected Routes)
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:productId` - Remove item from cart

### Orders (Protected Routes)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

## Usage

### For Users
1. **Browse Products**: Scroll to the products section to view available items
2. **Register/Login**: Click register or login buttons in the header
3. **Add to Cart**: Click "Add to Cart" on any product (requires login)
4. **View Cart**: Click the cart button in the header
5. **Place Order**: Click "Place Order" and fill in delivery details

### For Development
1. **Add Products**: Use the seed script or add directly to MongoDB
2. **Modify Styles**: Edit `css/style.css` for design changes
3. **Update Logic**: Modify `js/app.js` for frontend functionality
4. **Backend Changes**: Update files in the `backend/` directory

## Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  timestamps: true
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String (embroidery/painting),
  inStock: Boolean,
  timestamps: true
}
```

### Cart
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number
  }],
  timestamps: true
}
```

### Order
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (default: 'Placed'),
  customerInfo: {
    name: String,
    email: String,
    address: String,
    phone: String
  },
  timestamps: true
}
```

## Development Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample products

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- Input validation
- CORS enabled

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Future Enhancements

- Payment gateway integration
- Admin panel for product management
- Order tracking system
- Email notifications
- Product reviews and ratings
- Search and filter functionality

## Support

For any issues or questions, please contact:
- Email: ranjula.kumari@email.com
- Phone: +91 98765 43210

## License

This project is created for educational purposes as a college project.