"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const CART_STORAGE_KEY = "admin_cart_items";

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity: number }) => { ok: boolean; message?: string };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { ok: boolean; message?: string };
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(readStorage());
  }, []);

  // Persist whenever items change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = useCallback(
    (incoming: CartItem): { ok: boolean; message?: string } => {
      let result: { ok: boolean; message?: string } = { ok: true };

      setItems((prev) => {
        const idx = prev.findIndex((c) => c.productId === incoming.productId);
        if (idx !== -1) {
          const newQty = prev[idx].quantity + incoming.quantity;
          if (newQty > incoming.stock) {
            result = {
              ok: false,
              message: `Cannot add ${incoming.quantity} more — cart already has ${prev[idx].quantity} unit(s). Only ${incoming.stock} in stock.`,
            };
            return prev;
          }
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: newQty };
          return updated;
        }
        return [...prev, incoming];
      });

      return result;
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number): { ok: boolean; message?: string } => {
      let result: { ok: boolean; message?: string } = { ok: true };

      setItems((prev) => {
        const idx = prev.findIndex((c) => c.productId === productId);
        if (idx === -1) return prev;
        if (quantity < 1) {
          result = { ok: false, message: "Quantity must be at least 1." };
          return prev;
        }
        if (quantity > prev[idx].stock) {
          result = {
            ok: false,
            message: `Only ${prev[idx].stock} units in stock.`,
          };
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity };
        return updated;
      });

      return result;
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);


  const totalItems = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Context Hook: Custom Hook exposing Context state and operations via useContext
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export const useCartContext = useCart;
