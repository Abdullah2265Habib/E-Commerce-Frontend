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

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
};

export default function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    },
  });

  const handleCreate = async (values: FormValues) => {
    try {
      const token = (session as any)?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: values.name.trim(),
            description: values.description.trim(),
            price: parseFloat(values.price),
            stock: parseInt(values.stock, 10),
            category: values.category.trim(),
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
        toast.error(data.message || "Failed to create product");
        return;
      }

      toast.success("Product created successfully");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="e.g. Wireless Headphones"
              {...register("name", { required: "Product name is required" })}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Input
              id="product-description"
              placeholder="Brief description of the product"
              {...register("description")}
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Price ($)</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be ≥ 0" },
                })}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-stock">Stock</Label>
              <Input
                id="product-stock"
                type="number"
                min="0"
                placeholder="0"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be ≥ 0" },
                })}
              />
              {errors.stock && (
                <p className="text-xs text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              placeholder="e.g. Electronics"
              {...register("category", { required: "Category is required" })}
            />
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
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
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
