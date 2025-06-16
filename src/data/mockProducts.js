// src/data/mockProducts.js

export const mockProducts = [
  {
    id: "prod-001",
    slug: "eco-friendly-bamboo-keyboard",
    name: "Eco-Friendly Bamboo Keyboard",
    description: "Type in style with this sustainable and beautifully crafted bamboo wireless keyboard.",
    longDescription: "<p>Experience a unique blend of nature and technology with our Eco-Friendly Bamboo Keyboard. Crafted from sustainably sourced bamboo, this wireless keyboard not only looks stunning on any desk but also offers a comfortable and responsive typing experience. It features quiet keys, long battery life, and universal compatibility with Windows, macOS, and Linux.</p><p><strong>Key Features:</strong></p><ul><li>Sustainable bamboo construction</li><li>Wireless (2.4GHz) with USB receiver</li><li>Quiet, low-profile keys</li><li>Full-size layout with numeric keypad</li><li>Long-lasting rechargeable battery</li></ul>",
    price: 69.99,
    currency: "USD",
    images: [
      { id: "img-kb-1", src: "https://via.placeholder.com/600x400.png?text=Bamboo+Keyboard+Main", alt: "Eco-Friendly Bamboo Keyboard - Main View" },
      { id: "img-kb-2", src: "https://via.placeholder.com/600x400.png?text=Bamboo+Keyboard+Side", alt: "Eco-Friendly Bamboo Keyboard - Side View" },
      { id: "img-kb-3", src: "https://via.placeholder.com/600x400.png?text=Bamboo+Keyboard+Detail", alt: "Eco-Friendly Bamboo Keyboard - Key Detail" }
    ],
    category: "Electronics",
    brand: "EcoType",
    availability: "In Stock",
    rating: { average: 4.7, count: 185 },
    features: ["Sustainable Material", "Wireless Connectivity", "Quiet Keys", "Rechargeable"],
    specifications: [
      { name: "Material", value: "Bamboo, ABS Plastic" },
      { name: "Connectivity", value: "2.4GHz Wireless USB" },
      { name: "Battery", value: "500mAh Rechargeable Lithium-ion" },
      { name: "Dimensions", value: "40cm x 15cm x 2cm" }
    ]
  },
  {
    id: "prod-002",
    slug: "smart-reusable-notebook-letter",
    name: "Smart Reusable Notebook (Letter Size)",
    description: "A cloud-connected smart notebook that feels like traditional paper but is endlessly reusable.",
    longDescription: "<p>Introducing the future of note-taking! Our Smart Reusable Notebook provides a classic pen and paper experience, yet is endlessly reusable and connected to your favorite cloud services. Write using the included Pilot FriXion pen, then scan your notes using our companion app to save them to Google Drive, Dropbox, Evernote, email, and more. When you're ready to reuse, just wipe the pages clean with a damp cloth. Perfect for students, professionals, and anyone looking to reduce paper waste.</p><p>Includes one letter-sized notebook (8.5\" x 11\") and one Pilot FriXion pen.</p>",
    price: 34.95,
    currency: "USD",
    images: [
      { id: "img-nb-1", src: "https://via.placeholder.com/600x400.png?text=Smart+Notebook+Open", alt: "Smart Reusable Notebook - Open" },
      { id: "img-nb-2", src: "https://via.placeholder.com/600x400.png?text=Smart+Notebook+With+Pen", alt: "Smart Reusable Notebook with Pen" }
    ],
    category: "Office Supplies",
    brand: "EverWrite",
    availability: "In Stock",
    rating: { average: 4.5, count: 1250 },
    features: ["Endlessly Reusable", "Cloud Integration", "Includes FriXion Pen", "Eco-Friendly"],
    specifications: [
      { name: "Size", value: "Letter (8.5 x 11 inches)" },
      { name: "Pages", value: "32 reusable pages" },
      { name: "Compatibility", value: "iOS and Android companion app" }
    ]
  },
  {
    id: "prod-003",
    slug: "portable-espresso-maker-travel",
    name: "Portable Espresso Maker for Travel",
    description: "Enjoy delicious espresso anywhere, anytime with this compact and lightweight manual espresso maker.",
    longDescription: "<p>Never be without your espresso shot again! This portable espresso maker is designed for coffee lovers on the go. No batteries or electricity needed – just add your favorite ground coffee, hot water, and use the semi-automatic piston to extract a rich, flavorful espresso with a perfect crema. It's lightweight, durable, and easy to clean, making it an essential companion for travel, camping, or even the office.</p>",
    price: 49.00,
    currency: "USD",
    images: [
      { id: "img-em-1", src: "https://via.placeholder.com/600x400.png?text=Portable+Espresso+Maker", alt: "Portable Espresso Maker" },
      { id: "img-em-2", src: "https://via.placeholder.com/600x400.png?text=Espresso+Maker+In+Use", alt: "Portable Espresso Maker in Use" },
      { id: "img-em-3", src: "https://via.placeholder.com/600x400.png?text=Espresso+Shot", alt: "Espresso shot from portable maker" }
    ],
    category: "Kitchen & Travel",
    brand: "NomadBrew",
    availability: "Pre-order (Ships next month)",
    rating: { average: 4.8, count: 320 },
    features: ["Manual Operation (No Batteries)", "Compact & Lightweight", "Easy to Clean", "Rich Crema"],
    specifications: [
      { name: "Water Capacity", value: "80ml" },
      { name: "Ground Coffee Capacity", value: "8g" },
      { name: "Max Pressure", value: "18 bar (261 psi)" },
      { name: "Dimensions", value: "175mm x 70mm" }
    ]
  },
  {
    id: "prod-004",
    slug: "organic-cotton-tote-bag-graphic",
    name: "Organic Cotton Tote Bag - Graphic Print",
    description: "Stylish and eco-friendly tote bag made from 100% organic cotton with a unique graphic print.",
    longDescription: "<p>Carry your essentials in style while being kind to the planet with our organic cotton tote bag. Featuring a unique, eye-catching graphic print designed by independent artists, this tote is perfect for shopping, day trips, or as an everyday carry-all. It's durable, washable, and made from GOTS certified organic cotton.</p>",
    price: 22.50,
    currency: "USD",
    images: [
      { id: "img-tb-1", src: "https://via.placeholder.com/600x400.png?text=Organic+Tote+Bag", alt: "Organic Cotton Tote Bag with Graphic Print" }
    ],
    category: "Apparel & Accessories",
    brand: "EarthThreads",
    availability: "In Stock",
    rating: null, // Example of no rating yet
    features: ["100% Organic Cotton (GOTS Certified)", "Unique Artist Print", "Durable & Washable", "Eco-Friendly"],
    specifications: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Dimensions", value: "15\" W x 16\" H x 3\" D" },
      { name: "Handle Drop", value: "10\"" }
    ]
  }
];
