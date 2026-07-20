"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Package, DollarSign, Layers, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "./products-table";

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

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const getAddToCartSchema = (stock: number) => z.object({
  quantity: z.string().trim().min(1, "Quantity is required").refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 1;
  }, "Quantity must be at least 1").refine((val) => {
    const num = parseInt(val, 10);
    return num <= stock;
  }, `Maximum is ${stock} (available stock)`),
});

type FormValues = {
  quantity: string;
};

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export default function AddToCartDialog({
  open,
  onOpenChange,
  product,
}: AddToCartDialogProps) {
  const schema = getAddToCartSchema(product?.stock ?? 0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: "1" },
  });

  const quantity = parseInt(watch("quantity") || "1", 10);
  const total = product ? product.price * (isNaN(quantity) ? 0 : quantity) : 0;

  useEffect(() => {
    if (open) reset({ quantity: "1" });
  }, [open, reset]);

  const handleAddToCart = (values: FormValues) => {
    if (!product) return;

    const qty = parseInt(values.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast.error("Please enter a valid quantity.");
      return;
    }
    if (qty > product.stock) {
      toast.error(`Only ${product.stock} units available in stock.`);
      return;
    }

    const existing = getCartItems();
    const idx = existing.findIndex((c) => c.productId === product._id);

    if (idx !== -1) {
      const newQty = existing[idx].quantity + qty;
      if (newQty > product.stock) {
        toast.error(
          `Cannot add ${qty} more. Cart already has ${existing[idx].quantity} units. Only ${product.stock} in stock.`
        );
        return;
      }
      existing[idx].quantity = newQty;
      saveCartItems(existing);
      toast.success(`Updated cart: ${product.name} (×${newQty})`, {
        icon: <ShoppingCart className="h-4 w-4" />,
      });
    } else {
      const newItem: CartItem = {
        productId: product._id,
        productName: product.name,
        unitPrice: product.price,
        quantity: qty,
        category: product.category,
        imageUrl: product.images?.[0],
        stock: product.stock,
      };
      saveCartItems([...existing, newItem]);
      toast.success(`Added to cart: ${product.name} (×${qty})`, {
        icon: <ShoppingCart className="h-4 w-4" />,
        action: {
          label: "View Orders",
          onClick: () => {
            window.location.href = "/dashboard/order";
          },
        },
      });
    }

    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Add to Cart
          </DialogTitle>
          <DialogDescription>
            Select quantity to add{" "}
            <span className="font-semibold text-foreground">{product.name}</span>{" "}
            to your cart.
          </DialogDescription>
        </DialogHeader>

        {/* Product Preview */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0 overflow-hidden border">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {product.category}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border">
              <DollarSign className="h-3.5 w-3.5 text-green-500" />
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm font-semibold text-green-600">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border">
              <BarChart2 className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-xs text-muted-foreground">Stock</p>
              <p
                className={`text-sm font-semibold ${
                  product.stock === 0 ? "text-red-500" : "text-blue-600"
                }`}
              >
                {product.stock}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border">
              <Layers className="h-3.5 w-3.5 text-purple-500" />
              <p className="text-xs text-muted-foreground">Status</p>
              <p
                className={`text-sm font-semibold ${
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleAddToCart)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cart-quantity-dashboard">Quantity</Label>
            <Input
              id="cart-quantity-dashboard"
              type="number"
              min="1"
              max={product.stock}
              disabled={product.stock === 0}
              placeholder="1"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          {/* Subtotal preview */}
          {!isNaN(quantity) && quantity > 0 && (
            <div className="flex items-center justify-between rounded-md bg-muted/50 border px-4 py-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-green-600 text-base">
                ${total.toFixed(2)}
              </span>
            </div>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={product.stock === 0}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
