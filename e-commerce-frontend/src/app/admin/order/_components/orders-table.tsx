"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  User,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import CreateDialog from "./create-dialog";
import EditDialog from "./edit-dialog";
import DeleteDialog from "./delete-dialog";
import CartToOrderDialog from "./cart-to-order-dialog";
import { getCartItems } from "../../products/_components/add-to-cart-dialog";
import type { Order } from "./delete-dialog";

export default function OrdersTable({
  orders,
  currentPage,
  totalPage,
}: {
  orders: Order[];
  currentPage: number;
  totalPage: number;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Read cart count from localStorage (updates when dialog closes)
  useEffect(() => {
    const updateCount = () => setCartCount(getCartItems().length);
    updateCount();
    // Refresh on storage events (cross-tab) or when user navigates back
    window.addEventListener("storage", updateCount);
    window.addEventListener("focus", updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("focus", updateCount);
    };
  }, []);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditOpen(true);
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setDeleteOpen(true);
  };

  // Helper for Order Status Badge
  const getOrderStatusBadge = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Paid</Badge>;
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Shipped</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
    }
  };
  const getPaymentStatusBadge = (status?: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Paid</Badge>;
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Refund</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {orders.length} on this page
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and track customer purchases, payment confirmations, and shipments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCartCount(getCartItems().length);
                setCartOpen(true);
              }}
              className="relative gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          </div>
        </div>

        {/* Order List */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {orders.length > 0 ? (
            <Accordion multiple={false} className="w-full">
              {orders.map((order, index) => (
                <AccordionItem
                  key={order._id}
                  value={order._id}
                  className={index !== 0 ? "border-t" : ""}
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left flex-1 mr-4">
                      {/* Customer Profile Icon */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 border">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {order.userId?.name || "Guest User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {order.userId?.email || "No Email"}
                          </p>
                        </div>
                      </div>

                      {/* Order Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 shrink-0 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(order.createdAt).toLocaleDateString("en-GB")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-green-600 font-bold" />
                          <span className="font-semibold text-foreground text-sm">
                            {(order.totalAmount ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        {getOrderStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent>
                    <div className="px-6 pb-5 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
                        {/* Shipping Address */}
                        <div className="md:col-span-1 border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>Shipping Address</span>
                          </div>
                          <div className="text-sm space-y-1 text-muted-foreground">
                            <p className="text-foreground font-medium">{order.userId?.name || "Customer"}</p>
                            <p>{order.shippingAddress?.street}</p>
                            <p>
                              {order.shippingAddress?.city}, {order.shippingAddress?.country} {order.shippingAddress?.zip}
                            </p>
                          </div>
                        </div>

                        {/* Order Details & Summary */}
                        <div className="md:col-span-2 border rounded-lg p-4 bg-muted/20">
                          <div className="flex items-center gap-2 mb-3 font-semibold text-sm">
                            <ShoppingCart className="h-4 w-4 text-purple-500" />
                            <span>Ordered Items ({order.items?.length ?? 0})</span>
                          </div>
                          
                          <div className="divide-y text-sm">
                            {(order.items ?? []).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex justify-between py-2 first:pt-0 last:pb-0">
                                <div>
                                  <p className="font-medium text-foreground">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Qty: {item.quantity ?? 0} × ${(item.unitPrice ?? 0).toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-semibold text-foreground">
                                  ${((item.quantity ?? 0) * (item.unitPrice ?? 0)).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            
                            <div className="flex justify-between pt-3 border-t font-semibold text-base mt-2">
                              <span>Total Amount:</span>
                              <span className="text-green-600">${(order.totalAmount ?? 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {order._id}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(order)}
                          >
                            <Edit2 className="mr-1.5 h-3.5 w-3.5" />
                            Edit Status
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(order)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Delete Order
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <ShoppingCart className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No orders found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Wait for customers to check out, or click &quot;Create Order&quot; to add one.
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
              >
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
              >
                Next
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        order={selectedOrder}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        order={selectedOrder}
      />

      <CartToOrderDialog
        open={cartOpen}
        onOpenChange={(value) => {
          setCartOpen(value);
          if (!value) setCartCount(getCartItems().length);
        }}
      />
    </>
  );
}
