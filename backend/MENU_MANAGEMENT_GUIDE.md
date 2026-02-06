# Menu Management System - Complete Guide

## 🎉 Menu Management Implemented!

Complete menu management system for business owners to manage their restaurant menus, including categories, items, modifiers, business hours, and inventory.

---

## 📊 What's Been Implemented

### Database Models (6)
1. **MenuCategory** - Organize menu items into categories
2. **MenuItem** - Individual menu items with pricing and details
3. **ItemModifier** - Customization options (size, toppings, etc.)
4. **ModifierOption** - Specific modifier choices
5. **BusinessHours** - Operating hours for each day
6. **Inventory** - Stock management for menu items

### API Endpoints (20+)

#### Categories (4 endpoints)
- `POST /menu/categories` - Create category
- `GET /menu/categories` - Get all categories
- `PUT /menu/categories/:id` - Update category
- `DELETE /menu/categories/:id` - Delete category

#### Items (7 endpoints)
- `POST /menu/items` - Create menu item
- `GET /menu/items` - Get all items
- `GET /menu/items/:id` - Get single item
- `PUT /menu/items/:id` - Update item
- `PATCH /menu/items/:id/toggle-availability` - Toggle availability
- `DELETE /menu/items/:id` - Delete item

#### Modifiers (4 endpoints)
- `POST /menu/modifiers` - Create modifier
- `GET /menu/modifiers` - Get all modifiers
- `POST /menu/modifiers/:id/options` - Add modifier option
- `POST /menu/items/:itemId/modifiers/:modifierId` - Link modifier to item

#### Business Hours (3 endpoints)
- `POST /menu/business-hours` - Set business hours
- `GET /menu/business-hours` - Get business hours
- `GET /menu/business-hours/is-open` - Check if open now

#### Inventory (3 endpoints)
- `PUT /menu/inventory/:itemId` - Update inventory
- `GET /menu/inventory` - Get all inventory
- `GET /menu/inventory/low-stock` - Get low stock items

---

## 🧪 Testing Menu Management

### 1. Create Menu Category

```bash
POST http://localhost:3001/menu/categories
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "name": "Main Dishes",
  "description": "Our signature main courses",
  "displayOrder": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "category-uuid",
  "businessId": "business-uuid",
  "name": "Main Dishes",
  "description": "Our signature main courses",
  "displayOrder": 1,
  "isActive": true,
  "createdAt": "2026-02-06T23:00:00.000Z",
  "updatedAt": "2026-02-06T23:00:00.000Z"
}
```

### 2. Create Menu Item

```bash
POST http://localhost:3001/menu/items
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "categoryId": "category-uuid",
  "name": "Jollof Rice with Chicken",
  "description": "Traditional Nigerian jollof rice with grilled chicken",
  "price": 2500,
  "costPrice": 1200,
  "images": ["https://example.com/jollof.jpg"],
  "ingredients": ["Rice", "Tomatoes", "Chicken", "Spices"],
  "allergens": ["None"],
  "preparationTime": 20,
  "isAvailable": true,
  "isFeatured": true,
  "displayOrder": 1
}
```

**Response:**
```json
{
  "id": "item-uuid",
  "businessId": "business-uuid",
  "categoryId": "category-uuid",
  "name": "Jollof Rice with Chicken",
  "description": "Traditional Nigerian jollof rice with grilled chicken",
  "price": 2500,
  "costPrice": 1200,
  "images": ["https://example.com/jollof.jpg"],
  "ingredients": ["Rice", "Tomatoes", "Chicken", "Spices"],
  "allergens": ["None"],
  "preparationTime": 20,
  "isAvailable": true,
  "isFeatured": true,
  "displayOrder": 1,
  "createdAt": "2026-02-06T23:00:00.000Z",
  "updatedAt": "2026-02-06T23:00:00.000Z"
}
```

### 3. Create Modifier (Size Options)

```bash
POST http://localhost:3001/menu/modifiers
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "name": "Size",
  "type": "single",
  "isRequired": true,
  "displayOrder": 1
}
```

### 4. Add Modifier Options

```bash
POST http://localhost:3001/menu/modifiers/<modifier-id>/options
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "name": "Small",
  "priceAdjustment": 0,
  "displayOrder": 1,
  "isAvailable": true
}
```

```bash
POST http://localhost:3001/menu/modifiers/<modifier-id>/options
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "name": "Large",
  "priceAdjustment": 500,
  "displayOrder": 2,
  "isAvailable": true
}
```

### 5. Link Modifier to Item

```bash
POST http://localhost:3001/menu/items/<item-id>/modifiers/<modifier-id>
Authorization: Bearer <business-owner-token>
```

### 6. Set Business Hours

```bash
POST http://localhost:3001/menu/business-hours
Authorization: Bearer <business-owner-token>
Content-Type: application/json

[
  {
    "dayOfWeek": 0,
    "openingTime": "10:00",
    "closingTime": "22:00",
    "isClosed": true
  },
  {
    "dayOfWeek": 1,
    "openingTime": "09:00",
    "closingTime": "23:00",
    "isClosed": false
  },
  {
    "dayOfWeek": 2,
    "openingTime": "09:00",
    "closingTime": "23:00",
    "isClosed": false
  }
]
```

### 7. Update Inventory

```bash
PUT http://localhost:3001/menu/inventory/<item-id>
Authorization: Bearer <business-owner-token>
Content-Type: application/json

{
  "currentStock": 50,
  "minimumStock": 10,
  "unit": "portions",
  "costPerUnit": 1200,
  "supplier": "Local Farm"
}
```

### 8. Get Menu (Customer View)

```bash
GET http://localhost:3001/menu/categories?businessId=<business-id>
Authorization: Bearer <customer-token>
```

**Response:**
```json
[
  {
    "id": "category-uuid",
    "name": "Main Dishes",
    "description": "Our signature main courses",
    "displayOrder": 1,
    "isActive": true,
    "items": [
      {
        "id": "item-uuid",
        "name": "Jollof Rice with Chicken",
        "description": "Traditional Nigerian jollof rice",
        "price": 2500,
        "images": ["https://example.com/jollof.jpg"],
        "preparationTime": 20,
        "isAvailable": true,
        "isFeatured": true,
        "modifiers": [
          {
            "modifier": {
              "id": "modifier-uuid",
              "name": "Size",
              "type": "single",
              "isRequired": true,
              "options": [
                {
                  "id": "option-uuid",
                  "name": "Small",
                  "priceAdjustment": 0
                },
                {
                  "id": "option-uuid-2",
                  "name": "Large",
                  "priceAdjustment": 500
                }
              ]
            }
          }
        ]
      }
    ]
  }
]
```

### 9. Check if Business is Open

```bash
GET http://localhost:3001/menu/business-hours/is-open?businessId=<business-id>
Authorization: Bearer <token>
```

**Response:**
```json
{
  "isOpen": true,
  "message": "Open now",
  "hours": {
    "opening": "09:00",
    "closing": "23:00"
  }
}
```

### 10. Get Low Stock Items

```bash
GET http://localhost:3001/menu/inventory/low-stock
Authorization: Bearer <business-owner-token>
```

---

## 📱 Mobile App Integration

### React Native Example - Display Menu

```javascript
const MenuScreen = ({ businessId }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await fetch(
        `http://api.fulccrum.com/menu/categories?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
      {categories.map((category) => (
        <View key={category.id}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const MenuItem = ({ item }) => {
  const [selectedModifiers, setSelectedModifiers] = useState({});

  const calculatePrice = () => {
    let total = item.price;
    Object.values(selectedModifiers).forEach((option) => {
      total += option.priceAdjustment;
    });
    return total;
  };

  return (
    <View style={styles.menuItem}>
      <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <Text style={styles.itemPrice}>₦{calculatePrice().toFixed(2)}</Text>
      
      {item.modifiers.map((modifierLink) => (
        <ModifierSelector
          key={modifierLink.modifier.id}
          modifier={modifierLink.modifier}
          onSelect={(option) => {
            setSelectedModifiers({
              ...selectedModifiers,
              [modifierLink.modifier.id]: option,
            });
          }}
        />
      ))}
      
      <Button title="Add to Cart" onPress={() => addToCart(item, selectedModifiers)} />
    </View>
  );
};
```

---

## 🎯 Common Use Cases

### Use Case 1: Restaurant Setup

1. Create categories (Appetizers, Main Dishes, Desserts, Drinks)
2. Add menu items to each category
3. Create modifiers (Size, Spice Level, Toppings)
4. Link modifiers to items
5. Set business hours
6. Update inventory for items

### Use Case 2: Daily Operations

1. Check low stock items in the morning
2. Toggle item availability if out of stock
3. Update inventory after restocking
4. Check if business is open
5. Update prices or descriptions as needed

### Use Case 3: Customer Ordering

1. Fetch menu categories with items
2. Display items with modifiers
3. Calculate total price with selected modifiers
4. Add to cart with selected options
5. Check business hours before placing order

---

## 🔒 Security & Permissions

### Business Owner Can:
- ✅ Create/update/delete their own menu categories
- ✅ Create/update/delete their own menu items
- ✅ Create/update modifiers
- ✅ Set their business hours
- ✅ Manage their inventory

### Customers Can:
- ✅ View menu categories and items
- ✅ View modifiers and options
- ✅ Check business hours
- ❌ Cannot modify menu data

### Admin Can:
- ✅ View all menus
- ✅ Moderate content
- ✅ Assist with menu setup

---

## 📊 Database Schema

### MenuCategory
```
id: UUID
businessId: UUID (FK to BusinessProfile)
name: String (max 100)
description: Text (optional)
displayOrder: Integer
isActive: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### MenuItem
```
id: UUID
businessId: UUID
categoryId: UUID (FK to MenuCategory)
name: String (max 255)
description: Text (optional)
price: Decimal(10,2)
costPrice: Decimal(10,2) (optional)
images: JSON Array
ingredients: String Array
allergens: String Array
nutritionalInfo: JSON (optional)
preparationTime: Integer (minutes)
isAvailable: Boolean
isFeatured: Boolean
displayOrder: Integer
createdAt: DateTime
updatedAt: DateTime
```

### ItemModifier
```
id: UUID
businessId: UUID
name: String (max 100)
type: String ('single' or 'multiple')
isRequired: Boolean
displayOrder: Integer
createdAt: DateTime
updatedAt: DateTime
```

### ModifierOption
```
id: UUID
modifierId: UUID (FK to ItemModifier)
name: String (max 100)
priceAdjustment: Decimal(5,2)
displayOrder: Integer
isAvailable: Boolean
createdAt: DateTime
```

### BusinessHours
```
id: UUID
businessId: UUID (FK to BusinessProfile)
dayOfWeek: Integer (0-6, 0=Sunday)
openingTime: String (HH:MM)
closingTime: String (HH:MM)
isClosed: Boolean
createdAt: DateTime
updatedAt: DateTime
```

### Inventory
```
id: UUID
businessId: UUID
itemId: UUID (FK to MenuItem)
currentStock: Integer
minimumStock: Integer
unit: String (default: 'pieces')
costPerUnit: Decimal(8,2) (optional)
supplier: String (optional)
lastRestocked: DateTime (optional)
updatedAt: DateTime
```

---

## 🚀 Next Steps

### For Business Owners
1. Set up your menu categories
2. Add your menu items with images
3. Create modifiers for customization
4. Set your business hours
5. Manage inventory for stock tracking

### For Developers
1. Integrate menu display in mobile apps
2. Implement cart functionality with modifiers
3. Add menu search and filtering
4. Implement real-time stock updates
5. Add menu analytics

---

## 📝 Tips & Best Practices

### Menu Organization
- Use clear, descriptive category names
- Set logical display orders
- Use high-quality images for items
- Keep descriptions concise but informative

### Pricing
- Set both price and costPrice to track profit margins
- Use priceAdjustment for modifier options
- Consider bundling popular items

### Inventory Management
- Set realistic minimum stock levels
- Update inventory regularly
- Use low stock alerts to reorder
- Track supplier information

### Business Hours
- Keep hours up to date
- Mark special days as closed
- Use the is-open endpoint for real-time checks

---

**Menu Management System is now complete and ready for production! 🎉**
