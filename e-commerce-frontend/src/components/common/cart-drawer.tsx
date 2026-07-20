"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShoppingCart,
  Package,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/components/providers/cart-context";
import { useSession } from "next-auth/react";

/* ─── Checkout form schema ────────────────────────────────────── */

const checkoutSchema = z.object({
  street: z.string().trim().min(3, "Street is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  country: z.string().trim().min(2, "Country is required"),
  zipCode: z.string().trim().min(3, "Zip / postal code is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

/* ─── Cart Drawer ─────────────────────────────────────────────── */

export default function CartDrawer() {
  const { data: session } = useSession();
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearCart, isDrawerOpen, closeDrawer } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { street: "", city: "", state: "", country: "", zipCode: "" },
  });

  /* Group items by category for the accordion */
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handlePlaceOrder = async (values: CheckoutFormValues) => {
    if (items.length === 0) return;

    const token = (session as any)?.accessToken;
    if (!token) {
      toast.error("Please log in to place an order.");
      return;
    }

    setIsOrdering(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: items.map((i) => ({
              product: i.productId,
              quantity: i.quantity,
            })),
            shippingAddress: {
              street: values.street,
              city: values.city,
              state: values.state,
              country: values.country,
              zipCode: values.zipCode,
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to place order"
        );
        return;
      }

      toast.success("Order placed successfully!", {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        action: {
          label: "View Orders",
          onClick: () => (window.location.href = "/dashboard/orders"),
        },
      });

      clearCart();
      reset();
      setOrdered(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  const handleQtyChange = (productId: string, delta: number, currentQty: number) => {
    const result = updateQuantity(productId, currentQty + delta);
    if (!result.ok) toast.error(result.message);
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => { if (!open) { closeDrawer(); setOrdered(false); } }}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Shopping Cart
            {totalItems > 0 && (
              <Badge className="ml-1 h-5 text-xs px-1.5 rounded-full">
                {totalItems}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Review items and complete your order below.
          </SheetDescription>
        </SheetHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {ordered ? (
            /* Success state */
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-950/40 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">Order placed!</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Your order is being processed. You can track it in My Orders.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.href = "/dashboard/orders")}
                className="mt-1 gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                View Orders
              </Button>
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="p-3 bg-muted rounded-full">
                <ShoppingCart className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add products from the Products page.
              </p>
            </div>
          ) : (
            <>
              {/* Items grouped by category in accordion */}
              <Accordion className="w-full">
                {Object.entries(grouped).map(([category, catItems], i) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className={i !== 0 ? "border-t" : ""}
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs font-medium">
                          {category}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          {catItems.reduce((s, c) => s + c.quantity, 0)} item(s)
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-3 pt-1 pb-2">
                        {catItems.map((item) => (
                          <li
                            key={item.productId}
                            className="flex items-start gap-3 rounded-lg border bg-card p-3"
                          >
                            {/* Thumbnail */}
                            <div className="h-11 w-11 rounded-md overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.productName}</p>
                              <p className="text-xs text-green-600 font-semibold mt-0.5">
                                ${item.unitPrice.toFixed(2)} ea.
                              </p>

                              {/* Qty stepper */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => {
                                    if (item.quantity === 1) {
                                      removeItem(item.productId);
                                    } else {
                                      handleQtyChange(item.productId, -1, item.quantity);
                                    }
                                  }}
                                  aria-label="Decrease quantity"
                                  className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQtyChange(item.productId, 1, item.quantity)}
                                  aria-label="Increase quantity"
                                  className="flex h-6 w-6 items-center justify-center rounded border hover:bg-muted transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  of {item.stock}
                                </span>
                              </div>
                            </div>

                            {/* Line total + remove */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <p className="text-sm font-bold">
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeItem(item.productId)}
                                aria-label="Remove item"
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Order total summary */}
              <div className="rounded-lg border bg-muted/40 px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {totalItems} item(s)
                </span>
                <span className="text-base font-bold text-green-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Checkout form */}
              <form id="checkout-form" onSubmit={handleSubmit(handlePlaceOrder)} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  Shipping Address
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cart-street">Street</Label>
                  <Input id="cart-street" placeholder="123 Main St" {...register("street")} />
                  {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-city">City</Label>
                    <Input id="cart-city" placeholder="New York" {...register("city")} />
                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-state">State</Label>
                    <Input id="cart-state" placeholder="NY" {...register("state")} />
                    {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-zip">ZIP / Postal Code</Label>
                    <Input id="cart-zip" placeholder="10001" {...register("zipCode")} />
                    {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cart-country">Country</Label>
                    <Input id="cart-country" placeholder="US" {...register("country")} />
                    {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ── Footer actions ── */}
        {!ordered && items.length > 0 && (
          <SheetFooter className="border-t px-5 py-4 flex-col gap-2">
            <Button
              type="submit"
              form="checkout-form"
              disabled={isOrdering}
              className="w-full gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {isOrdering ? "Placing Order…" : `Place Order · $${totalPrice.toFixed(2)}`}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="w-full text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
