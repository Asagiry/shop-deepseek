import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any, size: string, quantity?: number) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  exportCart: () => string;
  importCart: (data: string) => boolean;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: any, size: string, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.size === size);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id && i.size === size
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: Math.min(quantity, product.stock),
        size,
        stock: product.stock,
      }];
    });
  }, []);

  const removeItem = useCallback((productId: number, size: string) => {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.product_id === productId && i.size === size
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const exportCart = useCallback(() => {
    return btoa(JSON.stringify(items));
  }, [items]);

  const importCart = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(atob(data));
      if (!Array.isArray(parsed)) return false;
      setItems(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      exportCart, importCart, totalItems, totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}