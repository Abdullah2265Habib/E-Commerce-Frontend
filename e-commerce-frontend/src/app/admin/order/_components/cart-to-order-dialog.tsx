"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
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
import {
  ShoppingCart,
  Trash2,
  Package,
  MapPin,
  User,
  DollarSign,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCartItems, saveCartItems, type CartItem } from "../../products/_components/add-to-cart-dialog";

interface CartPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ShippingFormValues = {
  userId: string;
  street: string;
  city: string;
  country: string;
  zip: string;
  status: string;
  paymentStatus: string;
};

interface UserOption {
  _id: string;
  name: string;
  email: string;
}

export default function CartToOrderDialog({
  open,
  onOpenChange,
}: CartPanelProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    defaultValues: {
      userId: "",
      street: "",
      city: "",
      country: "",
      zip: "",
      status: "pending",
      paymentStatus: "pending",
    },
  });

  // Load cart from localStorage
  useEffect(() => {
    if (open) {
      setCartItems(getCartItems());
    }
  }, [open]);

  // Fetch users when dialog opens
  useEffect(() => {
    if (!open) return;
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = (session as any)?.accessToken;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [open, session]);

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((c) => c.productId !== productId);
    setCartItems(updated);
    saveCartItems(updated);
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: string, qty: number) => {
    const item = cartItems.find((c) => c.productId === productId);
    if (!item) return;
    if (qty < 1) {
      removeFromCart(productId);
      return;
    }
    if (qty > item.stock) {
      toast.error(`Only ${item.stock} units available`);
      return;
    }
    const updated = cartItems.map((c) =>
      c.productId === productId ? { ...c, quantity: qty } : c
    );
    setCartItems(updated);
    saveCartItems(updated);
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handlePlaceOrder = async (values: ShippingFormValues) => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    try {
      const token = (session as any)?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            userId: values.userId,
            items: cartItems.map((c) => ({
              product: c.productId,
              quantity: c.quantity,
            })),
            shippingAddress: {
              street: values.street,
              city: values.city,
              country: values.country,
              zip: values.zip,
            },
            status: values.status,
            paymentStatus: values.paymentStatus,
          }),
        }
      );

      if (res.status === 401) {
        toast.error("Unauthorized: Session expired. Please log in again.", {
          id: "unauthorized-toast",
        });
        onOpenChange(false);
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to place order"
        );
        return;
      }

      // Clear cart on success
      saveCartItems([]);
      setCartItems([]);
      toast.success("Order placed successfully!", {
        icon: <ShoppingCart className="h-4 w-4" />,
      });
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const clearCart = () => {
    saveCartItems([]);
    setCartItems([]);
    toast.info("Cart cleared");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isSubmitting) {
          onOpenChange(value);
          if (!value) reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Cart — Place Order
            {cartItems.length > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {cartItems.length}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Review your cart and fill in shipping details to place an order.
          </DialogDescription>
        </DialogHeader>

        {/* Cart Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" />
              Cart Items ({cartItems.length})
            </p>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive text-xs h-7"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border bg-muted/20">
              <ShoppingCart className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-semibold text-sm text-foreground">
                Your cart is empty
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Go to the Products page to add items.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border divide-y overflow-hidden">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Image */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 shrink-0 overflow-hidden border">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${item.unitPrice.toFixed(2)} each · {item.category}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      −
                    </Button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-semibold text-green-600 w-20 text-right shrink-0">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive shrink-0"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              {/* Total row */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/40 font-semibold">
                <span className="text-sm flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Total Amount
                </span>
                <span className="text-base text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Form */}
        {cartItems.length > 0 && (
          <form
            onSubmit={handleSubmit(handlePlaceOrder)}
            className="space-y-4 border-t pt-4"
          >
            {/* Customer */}
            <div className="space-y-1.5">
              <Label
                htmlFor="cart-order-customer"
                className="flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Customer
              </Label>
              {loadingUsers ? (
                <div className="h-10 rounded-md border bg-muted/30 animate-pulse" />
              ) : (
                <select
                  id="cart-order-customer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("userId", {
                    required: "Please select a customer",
                  })}
                >
                  <option value="">Select a customer...</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId.message}</p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <Label className="flex items-center gap-1.5 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Shipping Address
              </Label>
              <Input
                id="cart-street"
                placeholder="Street address"
                {...register("street", { required: "Street is required" })}
              />
              {errors.street && (
                <p className="text-xs text-red-500">{errors.street.message}</p>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Input
                    id="cart-city"
                    placeholder="City"
                    {...register("city", { required: "City is required" })}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    id="cart-country"
                    placeholder="Country"
                    {...register("country", { required: "Country is required" })}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500">
                      {errors.country.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    id="cart-zip"
                    placeholder="Zip"
                    {...register("zip", { required: "Zip is required" })}
                  />
                  {errors.zip && (
                    <p className="text-xs text-red-500">{errors.zip.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Statuses */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cart-order-status">Order Status</Label>
                <select
                  id="cart-order-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("status")}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cart-payment-status">Payment Status</Label>
                <select
                  id="cart-payment-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...register("paymentStatus")}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {isSubmitting ? "Placing Order..." : `Place Order · $${totalAmount.toFixed(2)}`}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Close if cart empty */}
        {cartItems.length === 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
