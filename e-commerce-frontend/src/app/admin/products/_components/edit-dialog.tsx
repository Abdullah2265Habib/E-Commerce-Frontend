"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "./products-table";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const editProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().optional(),
  price: z.string().trim().min(1, "Price is required").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Price must be a valid number ≥ 0"),
  stock: z.string().trim().min(1, "Stock is required").refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 0;
  }, "Stock must be a valid integer ≥ 0"),
  category: z.string().trim().min(1, "Category is required"),
});

type FormValues = z.infer<typeof editProductSchema>;

export default function EditDialog({ open, onOpenChange, product }: EditDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    },
  });

  useEffect(() => {
    if (product) {
      setValue("name", product.name);
      setValue("description", product.description ?? "");
      setValue("price", String(product.price));
      setValue("stock", String(product.stock));
      setValue("category", product.category);
      setExistingImages(product.images || []);
      setSelectedFiles([]);
    }
  }, [product, setValue]);

  useEffect(() => {
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (values: FormValues) => {
    if (!product) return;

    try {
      setLoading(true);
      const token = (session as any)?.accessToken;

      let uploadedUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("images", file);
        });

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/upload`,
          {
            method: "POST",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Failed to upload new product images");
        }

        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls || [];
      }

      const finalImages = [...existingImages, ...uploadedUrls];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products/${product._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: values.name.trim(),
            description: values.description?.trim() || "",
            price: parseFloat(values.price),
            stock: parseInt(values.stock, 10),
            category: values.category.trim(),
            images: finalImages,
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
        toast.error(data.message || "Failed to update product");
        return;
      }

      toast.success("Product updated successfully");
      onOpenChange(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
          if (!value) reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-product-name">Product Name</Label>
            <Input
              id="edit-product-name"
              placeholder="e.g. Wireless Headphones"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-product-description">Description</Label>
            <Input
              id="edit-product-description"
              placeholder="Brief description of the product"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-product-price">Price ($)</Label>
              <Input
                id="edit-product-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price")}
              />
              {errors.price && (
                <p className="text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-product-stock">Stock</Label>
              <Input
                id="edit-product-stock"
                type="number"
                min="0"
                placeholder="0"
                {...register("stock")}
              />
              {errors.stock && (
                <p className="text-xs text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-product-category">Category</Label>
            <Input
              id="edit-product-category"
              placeholder="e.g. Electronics"
              {...register("category")}
            />
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          {/* Existing Product Images */}
          {existingImages.length > 0 && (
            <div className="space-y-1.5">
              <Label>Existing Images</Label>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                    <img
                      src={image}
                      alt={`existing-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Images */}
          <div className="space-y-2">
            <Label htmlFor="edit-product-images">Upload New Images</Label>
            <div className="border border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors cursor-pointer relative flex flex-col items-center justify-center text-center space-y-1">
              <input
                id="edit-product-images"
                type="file"
                multiple
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Click to upload new images</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                    <img
                      src={preview}
                      alt={`preview-${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewFile(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
