"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  userId: string;
  items: Array<{
    product: string;
    quantity: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  status: string;
  paymentStatus: string;
};

interface UserOption {
  _id: string;
  name: string;
  email: string;
}

interface ProductOption {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      userId: "",
      items: [{ product: "", quantity: "1" }],
      shippingAddress: {
        street: "",
        city: "",
        country: "",
        zip: "",
      },
      status: "pending",
      paymentStatus: "pending",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch items to calculate total dynamically
  const watchedItems = watch("items");

  // Fetch users and products when dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const token = (session as any)?.accessToken;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const [usersRes, productsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products?limit=100`, { headers }),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          // Filter to only customers or list all users
          setUsers(usersData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
      } catch (error) {
        console.error("Failed to load options", error);
        toast.error("Failed to load users or products");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [open, session]);

  // Calculate order total
  const calculatedTotal = (watchedItems || []).reduce((acc, curr) => {
    const prod = products.find((p) => p._id === curr.product);
    const qty = parseInt(curr.quantity || "0", 10);
    if (prod && qty > 0) {
      return acc + prod.price * qty;
    }
    return acc;
  }, 0);

  const handleCreate = async (values: FormValues) => {
    try {
      const token = (session as any)?.accessToken;

      const formattedItems = values.items.map((item) => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
      }));

      // Validate quantities/stock
      for (const item of formattedItems) {
        const prod = products.find((p) => p._id === item.product);
        if (prod && prod.stock < item.quantity) {
          toast.error(`Insufficient stock for ${prod.name}. Stock: ${prod.stock}`);
          return;
        }
      }

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
            items: formattedItems,
            shippingAddress: values.shippingAddress,
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
        toast.error(data.message || "Failed to create order");
        return;
      }

      toast.success("Order created successfully");
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
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
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
          <DialogDescription>
            Manually log a new customer order.
          </DialogDescription>
        </DialogHeader>

        {loadingOptions ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">Loading users and products...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
            {/* Customer */}
            <div className="space-y-1.5">
              <Label htmlFor="order-customer">Customer</Label>
              <select
                id="order-customer"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("userId", { required: "Customer selection is required" })}
              >
                <option value="">Select a customer...</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId.message}</p>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-base font-semibold">Order Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product: "", quantity: "1" })}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  {/* Select Product */}
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`item-product-${index}`}>Product</Label>
                    <select
                      id={`item-product-${index}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...register(`items.${index}.product` as const, {
                        required: "Product is required",
                      })}
                    >
                      <option value="">Select product...</option>
                      {products.map((prod) => (
                        <option key={prod._id} value={prod._id}>
                          {prod.name} (${prod.price.toFixed(2)}) - Stock: {prod.stock}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-24 space-y-1">
                    <Label htmlFor={`item-qty-${index}`}>Qty</Label>
                    <Input
                      id={`item-qty-${index}`}
                      type="number"
                      min="1"
                      placeholder="1"
                      {...register(`items.${index}.quantity` as const, {
                        required: "Required",
                        min: { value: 1, message: "Min is 1" },
                      })}
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="shrink-0 h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {errors.items && (
                <p className="text-xs text-red-500">Please configure at least one order item.</p>
              )}
            </div>

            {/* Shipping Address */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Shipping Address</Label>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ship-street">Street Address</Label>
                  <Input
                    id="ship-street"
                    placeholder="e.g. 123 Main St"
                    {...register("shippingAddress.street", { required: "Street is required" })}
                  />
                  {errors.shippingAddress?.street && (
                    <p className="text-xs text-red-500">{errors.shippingAddress.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-city">City</Label>
                    <Input
                      id="ship-city"
                      placeholder="City"
                      {...register("shippingAddress.city", { required: "City is required" })}
                    />
                    {errors.shippingAddress?.city && (
                      <p className="text-xs text-red-500">{errors.shippingAddress.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-country">Country</Label>
                    <Input
                      id="ship-country"
                      placeholder="Country"
                      {...register("shippingAddress.country", { required: "Country is required" })}
                    />
                    {errors.shippingAddress?.country && (
                      <p className="text-xs text-red-500">{errors.shippingAddress.country.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ship-zip">Zip Code</Label>
                    <Input
                      id="ship-zip"
                      placeholder="Zip"
                      {...register("shippingAddress.zip", { required: "Zip is required" })}
                    />
                    {errors.shippingAddress?.zip && (
                      <p className="text-xs text-red-500">{errors.shippingAddress.zip.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Payment Status */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-order-status">Order Status</Label>
                <select
                  id="new-order-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("status")}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-payment-status">Payment Status</Label>
                <select
                  id="new-payment-status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("paymentStatus")}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Total Amount Indicator */}
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-md font-semibold text-lg border">
              <span className="text-sm text-muted-foreground font-normal">Calculated Total Price:</span>
              <span className="text-green-600">${calculatedTotal.toFixed(2)}</span>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
