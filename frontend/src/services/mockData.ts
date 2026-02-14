// ─── Mock Data for Customer App Testing ───
// This file provides realistic mock data for all customer-facing screens
// when the backend is not running.

// ─── Restaurants ───
export const mockRestaurants = [
  {
    id: 'rest-1',
    name: 'Mama Nkechi\'s Kitchen',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
    cuisine: 'Nigerian · Igbo',
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: '25-35 min',
    deliveryFee: '₦500',
    distance: '1.2 km',
    isOpen: true,
    businessHours: { monday: { open: '08:00', close: '22:00' }, tuesday: { open: '08:00', close: '22:00' }, wednesday: { open: '08:00', close: '22:00' }, thursday: { open: '08:00', close: '22:00' }, friday: { open: '08:00', close: '23:00' }, saturday: { open: '09:00', close: '23:00' }, sunday: { open: '10:00', close: '21:00' } },
    minimumOrder: 2000,
    priceRange: '₦₦',
    averagePrice: 2500,
    address: '15 Awolowo Road, Ikoyi, Lagos',
    phone: '+234 801 234 5678',
    tags: ['Popular', 'Fast Delivery'],
    dietaryOptions: ['Halal', 'Gluten Free Options'],
  },
  {
    id: 'rest-2',
    name: 'Suya Republic',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
    cuisine: 'Nigerian · Grills',
    rating: 4.6,
    reviewCount: 218,
    deliveryTime: '20-30 min',
    deliveryFee: 'Free',
    distance: '0.8 km',
    isOpen: true,
    businessHours: { monday: { open: '12:00', close: '23:00' }, tuesday: { open: '12:00', close: '23:00' }, wednesday: { open: '12:00', close: '23:00' }, thursday: { open: '12:00', close: '23:00' }, friday: { open: '12:00', close: '00:00' }, saturday: { open: '12:00', close: '00:00' }, sunday: { open: '14:00', close: '22:00' } },
    minimumOrder: 1500,
    priceRange: '₦',
    averagePrice: 1800,
    address: '42 Allen Avenue, Ikeja, Lagos',
    phone: '+234 802 345 6789',
    tags: ['Free Delivery', 'Best Suya'],
    dietaryOptions: ['Halal'],
  },
  {
    id: 'rest-3',
    name: 'The Jollof Place',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    cuisine: 'Nigerian · West African',
    rating: 4.9,
    reviewCount: 567,
    deliveryTime: '30-45 min',
    deliveryFee: '₦700',
    distance: '2.5 km',
    isOpen: true,
    minimumOrder: 3000,
    priceRange: '₦₦',
    averagePrice: 3200,
    address: '8 Admiralty Way, Lekki Phase 1, Lagos',
    phone: '+234 803 456 7890',
    tags: ['Top Rated', 'Jollof King'],
    dietaryOptions: ['Halal', 'Vegan Options'],
  },
  {
    id: 'rest-4',
    name: 'Pizza Palazzo',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop',
    cuisine: 'Italian · Pizza',
    rating: 4.5,
    reviewCount: 189,
    deliveryTime: '35-50 min',
    deliveryFee: '₦800',
    distance: '3.1 km',
    isOpen: true,
    minimumOrder: 4000,
    priceRange: '₦₦₦',
    averagePrice: 5500,
    address: '23 Victoria Island, Lagos',
    phone: '+234 804 567 8901',
    tags: ['Italian', 'Family Size'],
    dietaryOptions: ['Vegetarian Options', 'Gluten Free Options'],
  },
  {
    id: 'rest-5',
    name: 'Buka Express',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=400&fit=crop',
    cuisine: 'Nigerian · Local',
    rating: 4.3,
    reviewCount: 421,
    deliveryTime: '15-25 min',
    deliveryFee: '₦300',
    distance: '0.5 km',
    isOpen: true,
    minimumOrder: 1000,
    priceRange: '₦',
    averagePrice: 1200,
    address: '5 Herbert Macaulay Way, Yaba, Lagos',
    phone: '+234 805 678 9012',
    tags: ['Budget Friendly', 'Fast'],
    dietaryOptions: ['Halal'],
  },
  {
    id: 'rest-6',
    name: 'Dragon Palace',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
    cuisine: 'Chinese · Asian',
    rating: 4.4,
    reviewCount: 156,
    deliveryTime: '40-55 min',
    deliveryFee: '₦1,000',
    distance: '4.2 km',
    isOpen: false,
    minimumOrder: 5000,
    priceRange: '₦₦₦',
    averagePrice: 6000,
    address: '12 Ozumba Mbadiwe Ave, Victoria Island, Lagos',
    phone: '+234 806 789 0123',
    tags: ['Chinese', 'Dim Sum'],
    dietaryOptions: ['Vegetarian Options'],
  },
  {
    id: 'rest-7',
    name: 'Shawarma Hub',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop',
    cuisine: 'Lebanese · Shawarma',
    rating: 4.7,
    reviewCount: 298,
    deliveryTime: '15-20 min',
    deliveryFee: 'Free',
    distance: '0.9 km',
    isOpen: true,
    minimumOrder: 1500,
    priceRange: '₦',
    averagePrice: 1800,
    address: '31 Opebi Road, Ikeja, Lagos',
    phone: '+234 807 890 1234',
    tags: ['Free Delivery', 'Quick Bites'],
    dietaryOptions: ['Halal'],
  },
  {
    id: 'rest-8',
    name: 'Café Royale',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
    cuisine: 'Continental · Café',
    rating: 4.2,
    reviewCount: 134,
    deliveryTime: '25-40 min',
    deliveryFee: '₦600',
    distance: '1.8 km',
    isOpen: true,
    minimumOrder: 2500,
    priceRange: '₦₦',
    averagePrice: 3500,
    address: '7 Adeola Odeku Street, VI, Lagos',
    phone: '+234 808 901 2345',
    tags: ['Brunch', 'Coffee'],
    dietaryOptions: ['Vegan Options', 'Gluten Free Options'],
  },
];

// ─── Menu Items (per restaurant) ───
export const mockMenuItems: Record<string, any[]> = {
  'rest-1': [
    { id: 'mi-1-1', name: 'Jollof Rice & Chicken', description: 'Smoky party jollof rice with grilled chicken thigh, plantain and coleslaw', price: 3500, calories: 650, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop', category: 'Rice Dishes', isPopular: true, customizations: [{ id: 'c1', name: 'Extra Chicken', price: 800 }, { id: 'c2', name: 'Extra Plantain', price: 300 }] },
    { id: 'mi-1-2', name: 'Egusi Soup & Pounded Yam', description: 'Rich melon seed soup with assorted meat, stockfish, and smooth pounded yam', price: 4000, calories: 780, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1643823252777-4c3e99c9c56d?w=400&h=300&fit=crop', category: 'Soups & Swallow', isPopular: true, customizations: [{ id: 'c3', name: 'Extra Meat', price: 1000 }, { id: 'c4', name: 'Add Stockfish', price: 500 }] },
    { id: 'mi-1-3', name: 'Pepper Soup', description: 'Spicy goat meat pepper soup with utazi leaves', price: 3000, calories: 420, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', category: 'Soups & Swallow', isPopular: false, customizations: [{ id: 'c5', name: 'Extra Goat Meat', price: 800 }] },
    { id: 'mi-1-4', name: 'Fried Rice & Turkey', description: 'Nigerian-style fried rice with mixed vegetables and fried turkey', price: 3800, calories: 700, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', category: 'Rice Dishes', isPopular: true, customizations: [{ id: 'c6', name: 'Extra Turkey', price: 1200 }] },
    { id: 'mi-1-5', name: 'Ofada Rice & Sauce', description: 'Local brown rice with spicy ofada sauce and assorted protein', price: 3200, calories: 600, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop', category: 'Rice Dishes', isPopular: false, customizations: [] },
    { id: 'mi-1-6', name: 'Suya Platter', description: 'Spiced grilled beef skewers with onions, tomatoes, and yaji spice', price: 2500, calories: 380, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', category: 'Grills', isPopular: true, customizations: [{ id: 'c7', name: 'Extra Skewers (3)', price: 1500 }] },
    { id: 'mi-1-7', name: 'Moi Moi', description: 'Steamed bean pudding with egg, fish, and crayfish', price: 800, calories: 280, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', category: 'Sides', isPopular: false, customizations: [] },
    { id: 'mi-1-8', name: 'Chapman', description: 'Classic Nigerian cocktail with Fanta, Sprite, grenadine, and cucumber', price: 1200, calories: 180, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop', category: 'Drinks', isPopular: false, customizations: [] },
  ],
  'rest-2': [
    { id: 'mi-2-1', name: 'Beef Suya (10 sticks)', description: 'Classic spiced beef suya with yaji pepper, onions, and tomatoes', price: 3000, calories: 520, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', category: 'Suya', isPopular: true, customizations: [{ id: 'c8', name: 'Extra Yaji Spice', price: 200 }] },
    { id: 'mi-2-2', name: 'Chicken Suya (5 pieces)', description: 'Grilled chicken thighs marinated in suya spice blend', price: 2500, calories: 450, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop', category: 'Suya', isPopular: true, customizations: [] },
    { id: 'mi-2-3', name: 'Ram Suya', description: 'Tender ram meat suya with special spice blend', price: 4000, calories: 580, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop', category: 'Suya', isPopular: false, customizations: [] },
    { id: 'mi-2-4', name: 'Kidney Suya', description: 'Grilled beef kidney with suya spice', price: 2000, calories: 320, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop', category: 'Suya', isPopular: false, customizations: [] },
    { id: 'mi-2-5', name: 'Suya Combo Platter', description: 'Mix of beef, chicken, and kidney suya with sides', price: 5500, calories: 850, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1432139509613-5c4255a1d197?w=400&h=300&fit=crop', category: 'Combos', isPopular: true, customizations: [{ id: 'c9', name: 'Add Jollof Rice', price: 1500 }] },
    { id: 'mi-2-6', name: 'Grilled Tilapia', description: 'Whole grilled tilapia fish with pepper sauce', price: 4500, calories: 380, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=300&fit=crop', category: 'Fish', isPopular: false, customizations: [] },
  ],
  'rest-3': [
    { id: 'mi-3-1', name: 'Party Jollof Rice', description: 'The famous smoky party-style jollof rice with assorted protein', price: 4500, calories: 720, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=300&fit=crop', category: 'Signature', isPopular: true, customizations: [{ id: 'c10', name: 'Extra Protein', price: 1500 }] },
    { id: 'mi-3-2', name: 'Coconut Jollof', description: 'Unique coconut-infused jollof rice with grilled prawns', price: 5500, calories: 680, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', category: 'Signature', isPopular: true, customizations: [] },
    { id: 'mi-3-3', name: 'Jollof Spaghetti', description: 'Nigerian-style jollof spaghetti with chicken', price: 3000, calories: 550, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', category: 'Pasta', isPopular: false, customizations: [] },
    { id: 'mi-3-4', name: 'Plantain Chips & Dip', description: 'Crispy plantain chips with spicy pepper dip', price: 1500, calories: 320, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', category: 'Starters', isPopular: false, customizations: [] },
    { id: 'mi-3-5', name: 'Zobo Drink', description: 'Chilled hibiscus drink with pineapple and ginger', price: 800, calories: 120, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', category: 'Drinks', isPopular: true, customizations: [] },
  ],
  'rest-4': [
    { id: 'mi-4-1', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, and fresh basil', price: 5000, calories: 800, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop', category: 'Pizza', isPopular: true, customizations: [{ id: 'c11', name: 'Extra Cheese', price: 800 }] },
    { id: 'mi-4-2', name: 'Pepperoni Pizza', description: 'Loaded pepperoni with mozzarella and tomato sauce', price: 6000, calories: 950, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop', category: 'Pizza', isPopular: true, customizations: [] },
    { id: 'mi-4-3', name: 'Suya Pizza', description: 'Fusion pizza with suya-spiced beef, onions, and pepper', price: 6500, calories: 900, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Pizza', isPopular: true, customizations: [] },
    { id: 'mi-4-4', name: 'Garlic Bread', description: 'Toasted garlic bread with herb butter', price: 1500, calories: 280, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=400&h=300&fit=crop', category: 'Sides', isPopular: false, customizations: [] },
    { id: 'mi-4-5', name: 'Tiramisu', description: 'Classic Italian coffee-flavored dessert', price: 2500, calories: 350, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop', category: 'Desserts', isPopular: false, customizations: [] },
  ],
  'rest-5': [
    { id: 'mi-5-1', name: 'Amala & Ewedu', description: 'Smooth yam flour amala with ewedu and gbegiri soup', price: 1500, calories: 580, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1643823252777-4c3e99c9c56d?w=400&h=300&fit=crop', category: 'Swallow', isPopular: true, customizations: [{ id: 'c12', name: 'Add Assorted Meat', price: 800 }] },
    { id: 'mi-5-2', name: 'Eba & Okra Soup', description: 'Garri eba with fresh okra soup and fish', price: 1800, calories: 620, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', category: 'Swallow', isPopular: true, customizations: [] },
    { id: 'mi-5-3', name: 'Beans & Plantain', description: 'Stewed beans with fried ripe plantain', price: 1200, calories: 480, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', category: 'Local', isPopular: false, customizations: [] },
    { id: 'mi-5-4', name: 'Akara & Pap', description: 'Bean cakes with warm corn pap', price: 800, calories: 350, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', category: 'Breakfast', isPopular: true, customizations: [] },
    { id: 'mi-5-5', name: 'Yam Porridge', description: 'Spicy yam porridge with vegetables and smoked fish', price: 1500, calories: 520, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop', category: 'Local', isPopular: false, customizations: [] },
  ],
  'rest-7': [
    { id: 'mi-7-1', name: 'Chicken Shawarma', description: 'Grilled chicken wrapped in pita with garlic sauce, pickles, and fries', price: 2500, calories: 580, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', category: 'Shawarma', isPopular: true, customizations: [{ id: 'c13', name: 'Extra Sauce', price: 200 }, { id: 'c14', name: 'Double Meat', price: 800 }] },
    { id: 'mi-7-2', name: 'Beef Shawarma', description: 'Seasoned beef strips with hummus, tahini, and fresh veggies', price: 2800, calories: 620, prepTime: '12 min', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&h=300&fit=crop', category: 'Shawarma', isPopular: true, customizations: [] },
    { id: 'mi-7-3', name: 'Falafel Wrap', description: 'Crispy falafel with tahini, pickled turnips, and salad', price: 2200, calories: 450, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&h=300&fit=crop', category: 'Wraps', isPopular: false, customizations: [] },
    { id: 'mi-7-4', name: 'Hummus & Pita', description: 'Creamy hummus with warm pita bread and olive oil', price: 1500, calories: 320, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400&h=300&fit=crop', category: 'Starters', isPopular: false, customizations: [] },
  ],
};

// Default menu for restaurants without specific items
const defaultMenu = [
  { id: 'mi-def-1', name: 'House Special', description: 'Chef\'s signature dish of the day', price: 3500, calories: 600, prepTime: '20 min', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', category: 'Specials', isPopular: true, customizations: [] },
  { id: 'mi-def-2', name: 'Grilled Chicken', description: 'Herb-marinated grilled chicken with sides', price: 3000, calories: 480, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop', category: 'Mains', isPopular: false, customizations: [] },
  { id: 'mi-def-3', name: 'Mixed Salad', description: 'Fresh garden salad with vinaigrette', price: 1500, calories: 180, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', category: 'Sides', isPopular: false, customizations: [] },
];

// ─── Addresses ───
export const mockAddresses = [
  { id: 'addr-1', streetAddress: '15 Admiralty Way', city: 'Lekki', state: 'Lagos', zipCode: '101233', country: 'Nigeria', isDefault: true, label: 'Home', latitude: 6.4281, longitude: 3.4219 },
  { id: 'addr-2', streetAddress: '42 Adeola Odeku Street', city: 'Victoria Island', state: 'Lagos', zipCode: '101241', country: 'Nigeria', isDefault: false, label: 'Work', latitude: 6.4312, longitude: 3.4156 },
  { id: 'addr-3', streetAddress: '8 Allen Avenue', city: 'Ikeja', state: 'Lagos', zipCode: '100271', country: 'Nigeria', isDefault: false, label: 'Other', latitude: 6.6018, longitude: 3.3515 },
];

// ─── Orders ───
export const mockOrders = [
  {
    id: 'ord-1',
    orderNumber: 'FUL-2026-001',
    status: 'delivered',
    business: { businessName: 'Mama Nkechi\'s Kitchen', id: 'rest-1' },
    items: [
      { quantity: 2, menuItem: { name: 'Jollof Rice & Chicken' }, totalPrice: 7000 },
      { quantity: 1, menuItem: { name: 'Chapman' }, totalPrice: 1200 },
    ],
    subtotal: 8200,
    deliveryFee: 500,
    serviceFee: 200,
    taxAmount: 150,
    tipAmount: 200,
    totalAmount: 9250,
    estimatedDeliveryTime: new Date(Date.now() - 3600000).toISOString(),
    deliveredAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    paymentMethod: 'wallet',
    driver: { firstName: 'Chidi', lastName: 'Okonkwo', avatarUrl: null },
    deliveryAddress: { streetAddress: '15 Admiralty Way', city: 'Lekki' },
  },
  {
    id: 'ord-2',
    orderNumber: 'FUL-2026-002',
    status: 'preparing',
    business: { businessName: 'Suya Republic', id: 'rest-2' },
    items: [
      { quantity: 1, menuItem: { name: 'Suya Combo Platter' }, totalPrice: 5500 },
    ],
    subtotal: 5500,
    deliveryFee: 0,
    serviceFee: 150,
    taxAmount: 100,
    tipAmount: 0,
    totalAmount: 5750,
    estimatedDeliveryTime: new Date(Date.now() + 1800000).toISOString(),
    createdAt: new Date(Date.now() - 600000).toISOString(),
    paymentMethod: 'card',
    driver: null,
    deliveryAddress: { streetAddress: '15 Admiralty Way', city: 'Lekki' },
  },
  {
    id: 'ord-3',
    orderNumber: 'FUL-2026-003',
    status: 'delivered',
    business: { businessName: 'The Jollof Place', id: 'rest-3' },
    items: [
      { quantity: 1, menuItem: { name: 'Party Jollof Rice' }, totalPrice: 4500 },
      { quantity: 2, menuItem: { name: 'Zobo Drink' }, totalPrice: 1600 },
    ],
    subtotal: 6100,
    deliveryFee: 700,
    serviceFee: 180,
    taxAmount: 120,
    tipAmount: 500,
    totalAmount: 7600,
    estimatedDeliveryTime: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    paymentMethod: 'wallet',
    driver: { firstName: 'Emeka', lastName: 'Eze', avatarUrl: null },
    deliveryAddress: { streetAddress: '42 Adeola Odeku Street', city: 'Victoria Island' },
  },
  {
    id: 'ord-4',
    orderNumber: 'FUL-2026-004',
    status: 'delivered',
    business: { businessName: 'Buka Express', id: 'rest-5' },
    items: [
      { quantity: 1, menuItem: { name: 'Amala & Ewedu' }, totalPrice: 1500 },
      { quantity: 1, menuItem: { name: 'Akara & Pap' }, totalPrice: 800 },
    ],
    subtotal: 2300,
    deliveryFee: 300,
    serviceFee: 100,
    taxAmount: 50,
    tipAmount: 0,
    totalAmount: 2750,
    estimatedDeliveryTime: new Date(Date.now() - 172800000).toISOString(),
    deliveredAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 176400000).toISOString(),
    paymentMethod: 'cash',
    driver: { firstName: 'Tunde', lastName: 'Bakare', avatarUrl: null },
    deliveryAddress: { streetAddress: '15 Admiralty Way', city: 'Lekki' },
  },
];

// ─── Promos / Deals ───
export const mockPromos = [
  {
    id: 'promo-1',
    title: 'New User Welcome!',
    description: 'Get 20% off your first 3 orders. No minimum order required.',
    code: 'WELCOME20',
    discountPercent: 20,
    minOrder: 0,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=300&fit=crop',
  },
  {
    id: 'promo-2',
    title: 'Free Delivery Weekend',
    description: 'Enjoy free delivery on all orders above ₦3,000 this weekend.',
    code: 'FREEDEL',
    discountAmount: 1000,
    minOrder: 3000,
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=300&fit=crop',
  },
  {
    id: 'promo-3',
    title: 'Jollof Day Special',
    description: '₦500 off any jollof rice order from participating restaurants.',
    code: 'JOLLOF500',
    discountAmount: 500,
    minOrder: 2000,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&h=300&fit=crop',
  },
  {
    id: 'promo-4',
    title: 'Refer a Friend',
    description: 'Both you and your friend get ₦1,000 off when they place their first order.',
    code: 'REFER1K',
    discountAmount: 1000,
    minOrder: 2500,
    expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
  },
];

// ─── Trending Items ───
export const mockTrendingItems = [
  { id: 'tr-1', name: 'Jollof Rice & Chicken', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop', restaurant: 'Mama Nkechi\'s', ordersToday: 156, price: 3500 },
  { id: 'tr-2', name: 'Beef Suya', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop', restaurant: 'Suya Republic', ordersToday: 132, price: 3000 },
  { id: 'tr-3', name: 'Chicken Shawarma', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=200&fit=crop', restaurant: 'Shawarma Hub', ordersToday: 98, price: 2500 },
  { id: 'tr-4', name: 'Suya Pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', restaurant: 'Pizza Palazzo', ordersToday: 87, price: 6500 },
  { id: 'tr-5', name: 'Amala & Ewedu', image: 'https://images.unsplash.com/photo-1643823252777-4c3e99c9c56d?w=300&h=200&fit=crop', restaurant: 'Buka Express', ordersToday: 74, price: 1500 },
];

// ─── Notifications ───
export const mockNotifications = [
  { id: 'notif-1', title: 'Order Delivered!', body: 'Your order from Mama Nkechi\'s Kitchen has been delivered. Enjoy!', type: 'order', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'notif-2', title: '🔥 Flash Sale!', body: 'Get 30% off all orders for the next 2 hours. Use code FLASH30.', type: 'promo', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'notif-3', title: 'Rate your order', body: 'How was your meal from The Jollof Place? Leave a review!', type: 'order', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'notif-4', title: 'New restaurant nearby', body: 'Dragon Palace just opened near you. Check out their menu!', type: 'system', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

// ─── Reviews ───
export const mockReviews = [
  { id: 'rev-1', rating: 5, comment: 'Best jollof rice in Lagos! Always on time.', userName: 'Adaeze O.', createdAt: new Date(Date.now() - 86400000).toISOString(), images: ['https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&h=200&fit=crop'] },
  { id: 'rev-2', rating: 4, comment: 'Great suya, but delivery was a bit slow today.', userName: 'Kunle A.', createdAt: new Date(Date.now() - 172800000).toISOString(), images: [] },
  { id: 'rev-3', rating: 5, comment: 'The shawarma is incredible! Extra sauce is a must.', userName: 'Fatima B.', createdAt: new Date(Date.now() - 259200000).toISOString(), images: ['https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=200&h=200&fit=crop'] },
];

// ─── Popular Searches ───
export const mockPopularSearches = ['Jollof Rice', 'Suya', 'Shawarma', 'Pizza', 'Amala', 'Fried Rice', 'Pepper Soup', 'Chapman'];

// ─── Fees ───
export const mockFees = {
  deliveryFee: 500,
  serviceFee: 200,
  taxRate: 0.075,
};

// ─── Modifier Groups ───
export const mockModifierGroups = [
  {
    id: 'mod-1',
    name: 'Protein Choice',
    type: 'single',
    isRequired: true,
    options: [
      { id: 'opt-1', name: 'Chicken', priceAdjustment: 0 },
      { id: 'opt-2', name: 'Beef', priceAdjustment: 200 },
      { id: 'opt-3', name: 'Fish', priceAdjustment: 300 },
      { id: 'opt-4', name: 'Goat Meat', priceAdjustment: 500 },
    ],
  },
  {
    id: 'mod-2',
    name: 'Spice Level',
    type: 'single',
    isRequired: false,
    options: [
      { id: 'opt-5', name: 'Mild', priceAdjustment: 0 },
      { id: 'opt-6', name: 'Medium', priceAdjustment: 0 },
      { id: 'opt-7', name: 'Hot', priceAdjustment: 0 },
      { id: 'opt-8', name: 'Extra Hot', priceAdjustment: 0 },
    ],
  },
  {
    id: 'mod-3',
    name: 'Add-ons',
    type: 'multi',
    isRequired: false,
    options: [
      { id: 'opt-9', name: 'Fried Plantain', priceAdjustment: 300 },
      { id: 'opt-10', name: 'Coleslaw', priceAdjustment: 200 },
      { id: 'opt-11', name: 'Extra Rice', priceAdjustment: 500 },
      { id: 'opt-12', name: 'Moi Moi', priceAdjustment: 400 },
    ],
  },
];

// ─── Helper: Get menu items for a restaurant ───
export const getMenuForRestaurant = (restaurantId: string) => {
  return mockMenuItems[restaurantId] || defaultMenu;
};
