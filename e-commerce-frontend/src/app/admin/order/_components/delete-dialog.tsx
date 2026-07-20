"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images?: string[];
    } | null;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    zip: string;
  };
  createdAt: string;
}

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export default function DeleteDialog({ open, onOpenChange, order }: DeleteDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!order) return;

    try {
      setLoading(true);
      const token = (session as any)?.accessToken;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${order._id}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Failed to delete order");
        return;
      }

      toast.success("Order deleted successfully");
      onOpenChange(false);
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
        if (!loading) onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete order{" "}
            <span className="font-semibold text-foreground">{order?._id}</span>
            {order?.userId && (
              <>
                {" "}placed by{" "}
                <span className="font-semibold text-foreground">{order.userId.name}</span>
              </>
            )}
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" disabled={loading} onClick={handleDelete}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
