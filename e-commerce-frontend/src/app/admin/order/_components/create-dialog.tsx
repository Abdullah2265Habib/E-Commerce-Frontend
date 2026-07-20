"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createOrderSchema = z.object({
  userId: z.string().trim().min(1, "Customer selection is required"),
  items: z.array(
    z.object({
      product: z.string().trim().min(1, "Product is required"),
      quantity: z.string().trim().min(1, "Quantity is required").refine((val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1;
      }, "Min quantity is 1"),
    })
  ).min(1, "Please configure at least one order item"),
  shippingAddress: z.object({
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    country: z.string().trim().min(1, "Country is required"),
    zip: z.string().trim().min(1, "Zip is required"),
  }),
  status: z.string().trim().min(1, "Order status is required"),
  paymentStatus: z.string().trim().min(1, "Payment status is required"),
});

type FormValues = z.infer<typeof createOrderSchema>;

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

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createOrderSchema),
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

  const watchedItems = watch("items");

  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      try {
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
          setUsers(usersData);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
      } catch (error) {
        console.error("Failed to load options", error);
        toast.error("Failed to load users or products");
      }
    };

    fetchOptions();
  }, [open, session]);

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

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
          {/* Customer */}
          <div className="space-y-1.5">
            <Label htmlFor="order-customer">Customer</Label>
            <select
              id="order-customer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("userId")}
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
                    {...register(`items.${index}.product` as const)}
                  >
                    <option value="">Select product...</option>
                    {products.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.name} (${prod.price.toFixed(2)}) - Stock: {prod.stock}
                      </option>
                    ))}
                  </select>
                  {errors.items?.[index]?.product && (
                    <p className="text-xs text-red-500">{errors.items[index]?.product?.message}</p>
                  )}
                </div>

                {/* Quantity */}
                <div className="w-24 space-y-1">
                  <Label htmlFor={`item-qty-${index}`}>Qty</Label>
                  <Input
                    id={`item-qty-${index}`}
                    type="number"
                    min="1"
                    placeholder="1"
                    {...register(`items.${index}.quantity` as const)}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-xs text-red-500">{errors.items[index]?.quantity?.message}</p>
                  )}
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

            {errors.items && !Array.isArray(errors.items) && (
              <p className="text-xs text-red-500">{errors.items.message}</p>
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
                  {...register("shippingAddress.street")}
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
                    {...register("shippingAddress.city")}
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
                    {...register("shippingAddress.country")}
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
                    {...register("shippingAddress.zip")}
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
              {errors.status && (
                <p className="text-xs text-red-500">{errors.status.message}</p>
              )}
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
              {errors.paymentStatus && (
                <p className="text-xs text-red-500">{errors.paymentStatus.message}</p>
              )}
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
      </DialogContent>
    </Dialog>
  );
}
