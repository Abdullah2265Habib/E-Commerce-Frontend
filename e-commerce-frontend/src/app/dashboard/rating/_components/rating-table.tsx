"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Package,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MessageSquarePlus,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    category?: string;
  } | null;
  quantity: number;
  _id: string;
}

interface Order {
  _id: string;
  status: string;
  paymentStatus: string;
  createdAt?: string;
  items: OrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    country?: string;
  };
}


const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z.string().trim().min(3, "Comment must be at least 3 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

function StarRatingInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-1.5">
      <Label>Rating</Label>
      <div className="flex items-center gap-1" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hovered || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}


function ReviewForm({
  productId,
  productName,
  onSuccess,
}: {
  productId: string;
  productName: string;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const ratingValue = watch("rating");

  const onSubmit = async (values: ReviewFormValues) => {
    try {
      const token = (session as any)?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            product: productId,
            rating: values.rating,
            comment: values.comment,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Failed to submit review"
        );
        return;
      }

      toast.success(`Review submitted for "${productName}"!`, {
        icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" />,
      });
      reset();
      setSubmitted(true);
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium py-2">
        <CheckCircle2 className="h-4 w-4" />
        Review submitted — thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-3">
      {/* Star selector */}
      <StarRatingInput
        value={ratingValue}
        onChange={(v) => setValue("rating", v, { shouldValidate: true })}
        error={errors.rating?.message}
      />

      {/* Comment */}
      <div className="space-y-1.5">
        <Label htmlFor={`comment-${productId}`}>Comment</Label>
        <Input
          id={`comment-${productId}`}
          placeholder="Share your experience with this product…"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="text-xs text-red-500">{errors.comment.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          {isSubmitting ? "Submitting…" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}


export default function RatingTable({
  orders,
  currentPage,
  totalPage,
}: {
  orders: Order[];
  currentPage: number;
  totalPage: number;
}) {
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  const markReviewed = (productId: string) => {
    setReviewed((prev) => ({ ...prev, [productId]: true }));
  };

  const eligibleProducts: {
    product: NonNullable<OrderItem["product"]>;
    orderId: string;
    orderStatus: string;
    orderDate: string;
  }[] = [];

  const seenProducts = new Set<string>();

  for (const order of orders) {
    for (const item of order.items ?? []) {
      if (!item.product) continue;
      const pid = item.product._id;
      if (seenProducts.has(pid)) continue;
      seenProducts.add(pid);
      eligibleProducts.push({
        product: item.product,
        orderId: order._id,
        orderStatus: order.status,
        orderDate: order.createdAt ?? "",
      });
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Rate Products
              </h1>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {eligibleProducts.length} eligible
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your experience for products from paid or shipped orders.
            </p>
          </div>
        </div>

        {/* Products List */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {eligibleProducts.length > 0 ? (
            <Accordion className="w-full">
              {eligibleProducts.map((entry, index) => {
                const { product, orderStatus, orderDate } = entry;
                const isReviewed = reviewed[product._id];

                return (
                  <AccordionItem
                    key={product._id}
                    value={product._id}
                    className={index !== 0 ? "border-t" : ""}
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                      <div className="flex items-center gap-3 text-left flex-1 mr-4">
                        {/* Thumbnail */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0 overflow-hidden border">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-primary" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="text-green-600 font-medium">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.category && ` · ${product.category}`}
                          </p>
                        </div>

                        {/* Status badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isReviewed && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 text-xs hidden sm:flex gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Reviewed
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-xs hidden sm:flex ${
                              orderStatus === "shipped"
                                ? "text-blue-600 border-blue-200 bg-blue-50"
                                : "text-green-600 border-green-200 bg-green-50"
                            }`}
                          >
                            {orderStatus}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-6 pb-6 pt-2">
                        {/* Order info */}
                        <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            Order status:{" "}
                            <span className="font-medium text-foreground capitalize ml-0.5">
                              {orderStatus}
                            </span>
                          </span>
                          {orderDate && (
                            <span>
                              Ordered on:{" "}
                              <span className="font-medium text-foreground">
                                {new Date(orderDate).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                        </div>

                        {/* Review form or already-reviewed state */}
                        {isReviewed ? (
                          <div className="flex items-center gap-2 text-sm text-green-600 font-medium py-2 border rounded-md px-4 bg-green-50 dark:bg-green-950/20">
                            <CheckCircle2 className="h-4 w-4" />
                            You&apos;ve submitted a review for this product in this session.
                          </div>
                        ) : (
                          <ReviewForm
                            productId={product._id}
                            productName={product.name}
                            onSuccess={() => markReviewed(product._id)}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <Star className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No products to rate yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                You can rate products once your order has been paid or shipped.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Link
              href={`?page=${currentPage - 1}`}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : undefined}
            >
              <Button
                variant="outline"
                disabled={currentPage === 1}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPage || 1}
            </span>

            <Link
              href={`?page=${currentPage + 1}`}
              aria-disabled={currentPage >= totalPage}
              tabIndex={currentPage >= totalPage ? -1 : undefined}
            >
              <Button
                variant="outline"
                disabled={currentPage >= totalPage}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
