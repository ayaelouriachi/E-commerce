// products.js - Fichier central pour les données de produits
const defaultProducts = [
  {
    id: 1,
    title: "Premium T-Shirt",
    category: "clothing",
    price: 29.99,
    description: "Soft and comfortable premium cotton t-shirt with a modern fit. Available in multiple colors and sizes.",
    image: "images/shirt.png",
    details: "Made from 100% breathable cotton, this unisize t-shirt features a classic round neckline, short sleeves, and a relaxed modern cut that suits most body types. Available in multiple colors, it's easy to pair with any outfit and perfect for daily wear.",
    stock: 20
  },
  {
    id: 2,
    title: "Classic Jeans",
    category: "clothing",
    price: 59.99,
    description: "Classic denim jeans with a straight fit design. Durable and versatile for everyday wear.",
    image: "images/jeans.png",
    details: "Crafted from durable denim, these straight-fit jeans offer comfort and timeless style. Features include a zip fly, five pockets, and reinforced stitching, making them ideal for everyday use.",
    stock: 15
  },
  {
    id: 3,
    title: "Liquid Foundation",
    category: "makeup",
    price: 24.99,
    description: "Buildable coverage foundation with a natural finish, available in 12 shades.",
    image: "images/Fon.png",
    details: "This liquid foundation offers medium to full buildable coverage with a smooth, natural finish. Lightweight and long-lasting, it blends effortlessly and is available in 12 inclusive shades to suit various skin tones.",
    stock: 10
  },
  {
    id: 4,
    title: "Smartphone Case",
    category: "accessories",
    price: 19.99,
    description: "Durable and stylish smartphone case made from premium materials to protect your device.",
    image: "images/phone.png",
    details: "Protect your phone with this shock-absorbent, scratch-resistant case. Its slim, stylish design is made from high-quality TPU and polycarbonate for maximum durability and grip.",
    stock: 5
  },
  {
    id: 5,
    title: "Summer Dress",
    category: "clothing",
    price: 49.99,
    description: "Lightweight and breathable summer dress with a floral pattern. Perfect for warm weather.",
    image: "images/Robe.png",
    details: "Stay cool and stylish with this sleeveless summer dress, featuring a flattering A-line cut and breezy floral fabric. Perfect for casual outings or beach days.",
    stock: 8
  },
  {
    id: 6,
    title: "Matte Lipstick Set",
    category: "makeup",
    price: 34.99,
    description: "Set of 5 long‑wear matte lipsticks in a range of bold shades.",
    image: "images/Lip.png",
    details: "This set includes five richly pigmented matte lipsticks with a velvety texture and all-day wear. The formula is non-drying and glides on smoothly, offering bold color payoff in every swipe.",
    stock: 12
  },
  {
    id: 7,
    title: "Leather Wallet",
    category: "accessories",
    price: 39.99,
    description: "Genuine leather wallet with multiple card slots and a sleek design.",
    image: "images/Wal.png",
    details: "Handcrafted from premium leather, this slim wallet features multiple card slots, a bill compartment, and RFID protection. Elegant and functional for everyday use.",
    stock: 7
  },
  {
    id: 8,
    title: "Eyeshadow Palette",
    category: "makeup",
    price: 29.99,
    description: "12‑pan eyeshadow palette with a mix of mattes and shimmers for endless looks.",
    image: "images/eye.png",
    details: "Create endless looks with this versatile 12-shade palette, featuring highly pigmented mattes and luminous shimmers. Blendable and buildable, perfect for both day and night makeup.",
    stock: 9
  },
  {
    id: 9,
    title: "Winter Jacket",
    category: "clothing",
    price: 149.99,
    description: "Warm and windproof winter jacket with a stylish design and multiple pockets.",
    image: "images/jacket.png",
    details: "This insulated winter jacket combines function and fashion. It features a windproof outer shell, warm lining, detachable hood, and multiple zipped pockets. Ideal for cold climates.",
    stock: 6
  },
  {
    id: 10,
    title: "Sunglasses",
    category: "accessories",
    price: 89.99,
    description: "Designer sunglasses with UV protection and polarized lenses for exceptional clarity.",
    image: "images/Sun.png",
    details: "Elevate your look with these high-end sunglasses, featuring UV400 protection and polarized lenses to reduce glare. Lightweight frame design ensures comfort and durability all day long.",
    stock: 4
  }
];

// Fonction pour initialiser les produits dans localStorage si nécessaire
function initProducts() {
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(defaultProducts));
  }
  return JSON.parse(localStorage.getItem('products'));
}

// Exporte les fonctions et données nécessaires
export { defaultProducts, initProducts };