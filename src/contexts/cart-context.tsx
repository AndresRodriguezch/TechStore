"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useAuth } from './auth-context';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth(); // Get user from AuthContext

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (user) {
      const storedCart = localStorage.getItem(`cart_${user.uid}`);
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } else {
        // Clear cart when user logs out
        setCart([]);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.uid}`, JSON.stringify(cart));
    }
     if (!user) {
      localStorage.removeItem('cart'); // Remove generic cart if any
    }
  }, [cart, user]);


  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, update its quantity, but don't exceed stock
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        // If item doesn't exist, add it to the cart
        return [...prevCart, { ...product, quantity: Math.min(quantity, product.stock) }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      // Otherwise, update the quantity, but don't exceed stock
      return prevCart.map(item => {
         if (item.id === productId) {
             const newQuantity = Math.min(quantity, item.stock);
             return { ...item, quantity: newQuantity };
         }
         return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
