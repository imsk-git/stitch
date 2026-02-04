const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');
require('dotenv').config();

const categories = [
  {
    name: "Madhubani Painting",
    description: "Traditional Mithila art form featuring intricate patterns and mythological themes",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop"
  },
  {
    name: "Embroidery",
    description: "Handcrafted embroidery items including wall art, accessories, and home decor",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop"
  },
  {
    name: "Hand Accessories",
    description: "Handmade bracelets, bangles, and other hand accessories with traditional craftsmanship",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop"
  },
  {
    name: "Canvas Paintings",
    description: "Acrylic, oil, and mixed media paintings on canvas - modern and traditional styles",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
  },
  {
    name: "Home Decor",
    description: "Handcrafted items for home decoration including wall hangings, table runners, and more",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
  }
];

const getProducts = (categoryMap) => [
  // Madhubani Paintings
  {
    name: "Madhubani Fish Painting",
    description: "Traditional Madhubani art featuring twin fish motif, symbolizing prosperity and fertility. Hand-painted on handmade paper with natural colors.",
    price: 1800,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    category: categoryMap["Madhubani Painting"]
  },
  {
    name: "Madhubani Peacock Art",
    description: "Vibrant peacock design in authentic Madhubani style. Features intricate geometric patterns and traditional motifs.",
    price: 2200,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=300&fit=crop",
    category: categoryMap["Madhubani Painting"]
  },
  {
    name: "Madhubani Tree of Life",
    description: "Sacred Tree of Life painting in traditional Mithila art style. Represents the connection between heaven and earth.",
    price: 2500,
    image: "https://images.unsplash.com/photo-1549289524-06cf8837ace5?w=400&h=300&fit=crop",
    category: categoryMap["Madhubani Painting"]
  },
  {
    name: "Madhubani Krishna Painting",
    description: "Beautiful depiction of Lord Krishna in Madhubani style. Rich colors and detailed border patterns.",
    price: 3000,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: categoryMap["Madhubani Painting"]
  },
  // Embroidery
  {
    name: "Embroidered Clutch Purse",
    description: "Handcrafted clutch with intricate embroidery work. Perfect for ethnic occasions and gifting.",
    price: 850,
    image: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=300&fit=crop",
    category: categoryMap["Embroidery"]
  },
  {
    name: "Handmade Embroidery Hoop Art",
    description: "Decorative embroidery hoop with floral design. Ready to hang wall decor.",
    price: 650,
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop",
    category: categoryMap["Embroidery"]
  },
  // Hand Accessories
  {
    name: "Hand Embroidered Bracelet Set",
    description: "Set of 3 fabric bracelets with colorful thread embroidery. Adjustable size, lightweight and trendy.",
    price: 450,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop",
    category: categoryMap["Hand Accessories"]
  },
  {
    name: "Handmade Beaded Bangle",
    description: "Colorful beaded bangle with traditional patterns. One size fits most.",
    price: 350,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
    category: categoryMap["Hand Accessories"]
  },
  // Canvas Paintings
  {
    name: "Warli Art Wall Painting",
    description: "Tribal Warli painting depicting village life and celebrations. Hand-painted on canvas.",
    price: 1600,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: categoryMap["Canvas Paintings"]
  },
  {
    name: "Acrylic Landscape Painting",
    description: "Serene landscape painting with mountains and sunset. Original acrylic artwork on stretched canvas.",
    price: 2800,
    image: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop",
    category: categoryMap["Canvas Paintings"]
  },
  {
    name: "Abstract Modern Art",
    description: "Contemporary abstract painting with bold colors. Makes a stunning statement piece for modern homes.",
    price: 3200,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&h=300&fit=crop",
    category: categoryMap["Canvas Paintings"]
  },
  // Home Decor
  {
    name: "Embroidered Table Runner",
    description: "Elegant table runner with traditional embroidery patterns. Made from premium cotton fabric.",
    price: 1200,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    category: categoryMap["Home Decor"]
  },
  {
    name: "Mandala Canvas Painting",
    description: "Intricate mandala design hand-painted on canvas. Promotes peace and meditation.",
    price: 1400,
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
    category: categoryMap["Home Decor"]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stitch');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create category map for products
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create products with category references
    const products = getProducts(categoryMap);
    await Product.insertMany(products);
    console.log(`Created ${products.length} products`);

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin',
        email: 'admin',
        password: 'admin',
        isAdmin: true
      });
      await adminUser.save();
      console.log('Admin user created! Email: admin, Password: admin');
    } else {
      console.log('Admin user already exists');
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();