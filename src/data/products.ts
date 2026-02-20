// src/data/products.ts
import type { Product } from '../types/product';

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "ASUS ROG Strix RTX 4090 OC", 
    category: "GPU", 
    brand: "ASUS", 
    vram: "24GB", 
    price: 1999.99, 
    specs: "24GB GDDR6X • DLSS 3.5", 
    badge: "In Stock",
    rating: 4.9,
    reviews: 128,
    description: "The ASUS ROG Strix GeForce RTX 4090 brings a whole new meaning to going with the flow."
  },
  { 
    id: 7, 
    name: "AMD Ryzen 9 7950X3D", 
    category: "CPU", 
    brand: "AMD", 
    vram: "N/A", 
    price: 699.00, 
    specs: "16 Cores • 32 Threads • 144MB Cache",
    badge: "Top Rated",
    rating: 4.9,
    reviews: 245,
    description: "The ultimate gaming processor, featuring AMD 3D V-Cache technology for massive gaming performance."
  },
  { 
    id: 8, 
    name: "Intel Core i9-14900K", 
    category: "CPU", 
    brand: "Intel", 
    vram: "N/A", 
    price: 589.00, 
    specs: "24 Cores • 32 Threads • 6.0 GHz Turbo",
    rating: 4.8,
    reviews: 189,
    description: "Experience the power of the 14th Gen Intel Core i9-14900K processor."
  },
  { 
    id: 9, 
    name: "Corsair Vengeance RGB 32GB DDR5", 
    category: "RAM", 
    brand: "Corsair", 
    vram: "N/A", 
    price: 124.99, 
    specs: "32GB (2x16GB) • 6000MHz • CL30",
    badge: "Best Seller",
    rating: 4.7,
    reviews: 512,
    description: "CORSAIR VENGEANCE RGB DDR5 memory delivers DDR5 performance, higher frequencies, and greater capacities."
  },
  { 
    id: 10, 
    name: "Samsung Odyssey Neo G9", 
    category: "Monitor", 
    brand: "Samsung", 
    vram: "N/A", 
    price: 1299.99, 
    specs: "49\" Curved • 240Hz • Mini-LED",
    badge: "Premium",
    rating: 4.6,
    reviews: 78,
    description: "Spellbinding visual quality and a new world of immersion with the Odyssey Neo G9."
  },
  { 
    id: 11, 
    name: "ASUS ROG Swift PG27AQDM", 
    category: "Monitor", 
    brand: "ASUS", 
    vram: "N/A", 
    price: 899.00, 
    specs: "27\" OLED • 1440p • 240Hz",
    rating: 4.9,
    reviews: 112,
    description: "The ROG Swift OLED PG27AQDM features a 27-inch 1440p OLED panel with 240Hz refresh rate."
  },
  { 
    id: 2, 
    name: "MSI Gaming X Slim RTX 4070 Ti", 
    category: "GPU", 
    brand: "MSI", 
    vram: "12GB", 
    price: 799.00, 
    specs: "12GB GDDR6X • White Edition", 
    badge: "Best Seller",
    rating: 4.7,
    reviews: 85,
    description: "GAMING Slim series is a thinner variant of GAMING series."
  },
  { 
    id: 3, 
    name: "Gigabyte AORUS RTX 4080 Master", 
    category: "GPU", 
    brand: "Gigabyte", 
    vram: "16GB", 
    price: 1149.00, 
    specs: "16GB GDDR6X • LCD Edge View",
    rating: 4.8,
    reviews: 54,
    description: "The AORUS Master RTX 4080 features the WINDFORCE cooling system."
  },
  { 
    id: 4, 
    name: "AMD Radeon RX 7900 XTX", 
    category: "GPU", 
    brand: "AMD", 
    vram: "24GB", 
    price: 949.00, 
    specs: "24GB GDDR6 • RDNA 3 Architecture",
    rating: 4.6,
    reviews: 210,
    description: "Experience unprecedented performance at 4K and beyond."
  }
];
