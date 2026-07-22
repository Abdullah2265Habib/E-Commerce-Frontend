"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
// Context Hook: useCartContext custom context hook
import { useCartContext } from "@/components/providers/cart-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Package,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";



const checkoutSchema = z.object({
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  country: z.string().trim().min(1, "Country is required"),
  zip: z.string().trim().min(1, "Zip / postal code is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;



function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

export default function CartPage() {
  const { data: session } = useSession();
  
  // Context Hook: Consuming cart state and methods using custom useContext hook
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCartContext();

  const [isOrdering, setIsOrdering] = useState(false);

  // Ref Hook: Reference to checkout form container
  const checkoutFormRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      street: "",
      city: "",
      country: "",
      zip: "",
    },
  });

  // Performance Hook: useMemo to memoize grouped cart items calculation
  const grouped = useMemo(() => {
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      const cat = item.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [items]);

  // Performance Hook: useCallback to memoize quantity change handler
  const handleQtyChange = useCallback(
    (productId: string, delta: number, currentQty: number) => {
      if (currentQty + delta < 1) {
        removeItem(productId);
        return;
      }
      const result = updateQuantity(productId, currentQty + delta);
      if (!result.ok) toast.error(result.message);
    },
    [removeItem, updateQuantity]
  );

  const onSubmit = async (values: CheckoutFormValues) => {
    const token = (session as any)?.accessToken;
    if (!token) {
      toast.error("Please log in to place an order.");
      return;
    }

    setIsOrdering(true);
    try {
      const orderRes = await fetch(
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
              country: values.country,
              zip: values.zip,
            },
          }),
        }
      );

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(
          Array.isArray(orderData.message)
            ? orderData.message.join(", ")
            : orderData.message || "Failed to place order"
        );
        return;
      }

      const orderId: string = orderData._id ?? orderData.id ?? orderData.data?._id;
      if (!orderId) {
        toast.error("Order was placed but could not retrieve order ID.");
        return;
      }

      const paymentRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payments/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        toast.error(
          Array.isArray(paymentData.message)
            ? paymentData.message.join(", ")
            : paymentData.message || "Failed to initiate payment"
        );
        return;
      }

      clearCart();
      reset();

      if (paymentData.url) {
        window.location.href = paymentData.url;
      } else {
        toast.success("Order placed! Redirecting to payment…");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };


  if (items.length === 0) {
    return (
      <div className="container max-w-5xl mx-auto py-16 flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-muted rounded-full">
          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground max-w-xs">
          Browse the product catalog and add items to your cart.
        </p>
        <Link href="/dashboard/product">
          <Button className="mt-2 gap-2">
            <Package className="h-4 w-4" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="container max-w-5xl mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">My Cart</h1>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your items and complete your order.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="gap-1.5 text-muted-foreground hover:text-red-500 self-start sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* ── Left: Items ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
              <Accordion className="w-full">
                {Object.entries(grouped).map(([category, catItems], i) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className={i !== 0 ? "border-t" : ""}
                  >
                    <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {catItems.reduce((s, c) => s + c.quantity, 0)} item
                          {catItems.reduce((s, c) => s + c.quantity, 0) !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <ul className="space-y-3 px-5 pt-1 pb-4">
                        {catItems.map((item) => (
                          <li
                            key={item.productId}
                            className="flex items-start gap-3 rounded-lg border bg-background p-3"
                          >
                            {/* Thumbnail */}
                            <div className="h-14 w-14 rounded-md overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {item.productName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.category}
                              </p>
                              <p className="text-xs text-green-600 font-medium mt-1">
                                ${item.unitPrice.toFixed(2)} / unit
                              </p>

                              {/* Qty stepper */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    handleQtyChange(
                                      item.productId,
                                      -1,
                                      item.quantity
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted transition-colors"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQtyChange(
                                      item.productId,
                                      1,
                                      item.quantity
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  className="flex h-7 w-7 items-center justify-center rounded border hover:bg-muted transition-colors"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs text-muted-foreground ml-1">
                                  of {item.stock} in stock
                                </span>
                              </div>
                            </div>

                            {/* Line total + remove */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <p className="text-sm font-bold text-green-600">
                                ${(item.unitPrice * item.quantity).toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeItem(item.productId)}
                                aria-label="Remove item"
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* ── Right: Summary + Checkout form ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Summary tiles */}
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                icon={<ShoppingCart className="h-4 w-4" />}
                label="Items"
                value={`${totalItems} total`}
              />
              <InfoTile
                icon={<ReceiptText className="h-4 w-4" />}
                label="Total"
                value={
                  <span className="text-green-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                }
              />
            </div>

            {/* Checkout form */}
            <form
              ref={checkoutFormRef}
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-lg border bg-card shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                Shipping Address
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-street">Street</Label>
                <Input
                  id="page-street"
                  placeholder="123 Main St"
                  {...register("street")}
                />
                {errors.street && (
                  <p className="text-xs text-red-500">{errors.street.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="page-city">City</Label>
                  <Input
                    id="page-city"
                    placeholder="New York"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="page-zip">ZIP / Postal Code</Label>
                  <Input
                    id="page-zip"
                    placeholder="10001"
                    {...register("zip")}
                  />
                  {errors.zip && (
                    <p className="text-xs text-red-500">{errors.zip.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="page-country">Country</Label>
                <Input
                  id="page-country"
                  placeholder="US"
                  {...register("country")}
                />
                {errors.country && (
                  <p className="text-xs text-red-500">{errors.country.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isOrdering}
                className="w-full gap-2 mt-1"
              >
                <CreditCard className="h-4 w-4" />
                {isOrdering
                  ? "Placing Order…"
                  : `Place Order · $${totalPrice.toFixed(2)}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
