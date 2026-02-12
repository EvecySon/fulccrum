import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers?: { groupId: string; groupName: string; optionId: string; optionName: string; priceAdjustment: number }[];
  customizations?: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

export interface CartRestaurant {
  id: string;
  name: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  restaurant: CartRestaurant | null;
  itemCount: number;
  subtotal: number;
  addItem: (restaurant: CartRestaurant, item: CartItem) => boolean;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  getItemTotal: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  restaurant: null,
  itemCount: 0,
  subtotal: 0,
  addItem: () => false,
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  getItemTotal: () => 0,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<CartRestaurant | null>(null);

  const getItemTotal = useCallback((item: CartItem) => {
    let base = item.price;
    if (item.modifiers) {
      base += item.modifiers.reduce((s, m) => s + m.priceAdjustment, 0);
    }
    if (item.customizations) {
      base += item.customizations.reduce((s, c) => s + c.price, 0);
    }
    return base * item.quantity;
  }, []);

  const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((rest: CartRestaurant, item: CartItem): boolean => {
    // If cart has items from a different restaurant, reject (caller should confirm clear)
    if (restaurant && restaurant.id !== rest.id && items.length > 0) {
      return false;
    }

    setRestaurant(rest);
    setItems(prev => {
      // Check if same item with same modifiers/customizations exists
      const existingIdx = prev.findIndex(
        i => i.menuItemId === item.menuItemId &&
          JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
          JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + item.quantity,
        };
        return updated;
      }

      return [...prev, item];
    });

    return true;
  }, [restaurant, items.length]);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => {
        const updated = prev.filter(i => i.menuItemId !== menuItemId);
        if (updated.length === 0) setRestaurant(null);
        return updated;
      });
    } else {
      setItems(prev => prev.map(i =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      ));
    }
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems(prev => {
      const updated = prev.filter(i => i.menuItemId !== menuItemId);
      if (updated.length === 0) setRestaurant(null);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurant(null);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      restaurant,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}
