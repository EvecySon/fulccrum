/**
 * Centralized business categories config.
 *
 * Used by:
 *  - Admin: Category Management screen (CRUD)
 *  - Merchant: Business setup & verification (select category)
 *  - Customer: Home screen browse + CategoryBrowseScreen
 *
 * To add a new category:
 *  1. Add an entry to BUSINESS_CATEGORIES below
 *  2. That's it — all screens auto-update
 *
 * Once the backend serves categories dynamically, replace this
 * with an API call. The shape stays the same.
 */

export interface BusinessCategory {
  key: string;
  label: string;
  icon: string;        // Ionicons name (without -outline)
  description: string;
  color: string;       // accent color for UI
  active: boolean;     // admin can deactivate a category
  sortOrder: number;   // display order
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    key: 'restaurant',
    label: 'Restaurants',
    icon: 'restaurant',
    description: 'Dine-in, takeaway, and delivery restaurants',
    color: '#ff6b35',
    active: true,
    sortOrder: 1,
  },
  {
    key: 'fast_food',
    label: 'Fast Food',
    icon: 'fast-food',
    description: 'Quick service restaurants and fast food joints',
    color: '#e74c3c',
    active: true,
    sortOrder: 2,
  },
  {
    key: 'grocery',
    label: 'Grocery',
    icon: 'cart',
    description: 'Supermarkets, grocery stores, and fresh produce',
    color: '#2ecc71',
    active: true,
    sortOrder: 3,
  },
  {
    key: 'bakery',
    label: 'Bakery & Pastry',
    icon: 'cafe',
    description: 'Bakeries, pastry shops, and cake makers',
    color: '#f39c12',
    active: true,
    sortOrder: 4,
  },
  {
    key: 'pharmacy',
    label: 'Pharmacy',
    icon: 'medkit',
    description: 'Pharmacies and health product stores',
    color: '#3498db',
    active: true,
    sortOrder: 5,
  },
  {
    key: 'convenience',
    label: 'Convenience',
    icon: 'storefront',
    description: 'Convenience stores and everyday essentials',
    color: '#9b59b6',
    active: true,
    sortOrder: 6,
  },
  {
    key: 'drinks',
    label: 'Drinks & Smoothies',
    icon: 'wine',
    description: 'Juice bars, smoothie shops, and drink vendors',
    color: '#1abc9c',
    active: true,
    sortOrder: 7,
  },
  {
    key: 'local_food',
    label: 'Local Food (Buka)',
    icon: 'flame',
    description: 'Traditional Nigerian food vendors and bukas',
    color: '#d35400',
    active: true,
    sortOrder: 8,
  },
  {
    key: 'other',
    label: 'Other',
    icon: 'grid',
    description: 'Other business types not listed above',
    color: '#7f8c8d',
    active: true,
    sortOrder: 99,
  },
];

/**
 * Get only active categories, sorted by sortOrder.
 */
export function getActiveCategories(): BusinessCategory[] {
  return BUSINESS_CATEGORIES
    .filter(c => c.active)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get a category by key.
 */
export function getCategoryByKey(key: string): BusinessCategory | undefined {
  return BUSINESS_CATEGORIES.find(c => c.key === key);
}

/**
 * Get icon for a category name (used by CategoryBrowseScreen).
 */
export function getCategoryIcon(categoryName: string): string {
  const cat = BUSINESS_CATEGORIES.find(
    c => c.label.toLowerCase() === categoryName.toLowerCase() ||
         c.key.toLowerCase() === categoryName.toLowerCase()
  );
  return cat?.icon || 'business';
}
