"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ReceiptText,
  BoxIcon,
} from "lucide-react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────── */

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
  updatedAt?: string;
  totalAmount?: number;
  items: OrderItem[];
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function orderStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "shipped":
      return {
        label: "Shipped",
        icon: Truck,
        className:
          "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800",
      };
    case "delivered":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        className:
          "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        className:
          "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800",
      };
    case "processing":
      return {
        label: "Processing",
        icon: Clock,
        className:
          "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-800",
      };
    default:
      return {
        label: status,
        icon: Package,
        className:
          "text-muted-foreground border-border bg-muted",
      };
  }
}

function paymentStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "succeeded":
      return {
        label: "Paid",
        icon: CheckCircle2,
        className:
          "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800",
      };
    case "pending":
      return {
        label: "Payment Pending",
        icon: AlertCircle,
        className:
          "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800",
      };
    case "failed":
      return {
        label: "Payment Failed",
        icon: XCircle,
        className:
          "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800",
      };
    default:
      return {
        label: status,
        icon: CreditCard,
        className:
          "text-muted-foreground border-border bg-muted",
      };
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAddress(addr?: Order["shippingAddress"]) {
  if (!addr) return null;
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.zipCode,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/* ─── Order Card (single accordion item) ─────────────────────── */

function OrderCard({ order, index }: { order: Order; index: number }) {
  const orderCfg = orderStatusConfig(order.status);
  const paymentCfg = paymentStatusConfig(order.paymentStatus);
  const OrderIcon = orderCfg.icon;
  const PayIcon = paymentCfg.icon;

  const itemCount = order.items?.length ?? 0;
  const firstItem = order.items?.[0];
  const firstProduct = firstItem?.product;

  const address = formatAddress(order.shippingAddress);

  const total =
    order.totalAmount != null
      ? order.totalAmount
      : order.items?.reduce(
          (sum, it) => sum + (it.product?.price ?? 0) * it.quantity,
          0
        );

  return (
    <AccordionItem
      value={order._id}
      className={index !== 0 ? "border-t" : ""}
    >
      {/* ── Trigger ── */}
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
        <div className="flex items-center gap-3 text-left flex-1 mr-4">
          {/* Thumbnail / icon */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0 overflow-hidden border">
            {firstProduct?.images?.[0] ? (
              <img
                src={firstProduct.images[0]}
                alt={firstProduct.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <BoxIcon className="h-5 w-5 text-primary" />
            )}
          </div>

          {/* Order info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              Order{" "}
              <span className="font-mono text-xs text-muted-foreground">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {formatDate(order.createdAt)}
              <span className="text-border">·</span>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Status badges (desktop) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <Badge variant="outline" className={`text-xs gap-1 ${orderCfg.className}`}>
              <OrderIcon className="h-3 w-3" />
              {orderCfg.label}
            </Badge>
            <Badge variant="outline" className={`text-xs gap-1 ${paymentCfg.className}`}>
              <PayIcon className="h-3 w-3" />
              {paymentCfg.label}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>

      {/* ── Content ── */}
      <AccordionContent>
        <div className="px-6 pb-6 pt-2 space-y-5">

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InfoTile
              icon={<OrderIcon className="h-4 w-4" />}
              label="Order Status"
              value={<span className="capitalize">{orderCfg.label}</span>}
            />
            <InfoTile
              icon={<PayIcon className="h-4 w-4" />}
              label="Payment"
              value={paymentCfg.label}
            />
            <InfoTile
              icon={<ReceiptText className="h-4 w-4" />}
              label="Total"
              value={
                total != null ? `$${total.toFixed(2)}` : "—"
              }
            />
            <InfoTile
              icon={<Calendar className="h-4 w-4" />}
              label="Placed On"
              value={formatDate(order.createdAt)}
            />
          </div>

          {/* Shipping address */}
          {address && (
            <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Shipping Address
                </p>
                <p className="text-foreground">{address}</p>
              </div>
            </div>
          )}

          {/* Items list */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Items ({itemCount})
            </p>
            <ul className="space-y-2">
              {order.items?.map((item) => {
                const p = item.product;
                return (
                  <li
                    key={item._id}
                    className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5"
                  >
                    {/* Thumbnail */}
                    <div className="h-10 w-10 rounded-md overflow-hidden border bg-muted shrink-0 flex items-center justify-center">
                      {p?.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Name & category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p ? p.name : <span className="italic text-muted-foreground">Deleted product</span>}
                      </p>
                      {p?.category && (
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      )}
                    </div>

                    {/* Qty & price */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        × {item.quantity}
                      </p>
                      {p && (
                        <p className="text-sm font-semibold text-green-600">
                          ${(p.price * item.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile badges */}
          <div className="flex sm:hidden flex-wrap gap-2">
            <Badge variant="outline" className={`text-xs gap-1 ${orderCfg.className}`}>
              <OrderIcon className="h-3 w-3" />
              {orderCfg.label}
            </Badge>
            <Badge variant="outline" className={`text-xs gap-1 ${paymentCfg.className}`}>
              <PayIcon className="h-3 w-3" />
              {paymentCfg.label}
            </Badge>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/* ─── Small info tile ─────────────────────────────────────────── */

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
    <div className="rounded-lg border bg-card px-3 py-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────── */

export default function OrdersList({
  orders,
  currentPage,
  totalPage,
}: {
  orders: Order[];
  currentPage: number;
  totalPage: number;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View your full order history and shipment details.
          </p>
        </div>
      </div>

      {/* Orders accordion */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <Accordion className="w-full">
            {orders.map((order, i) => (
              <OrderCard key={order._id} order={order} index={i} />
            ))}
          </Accordion>
        ) : (
          <div className="flex flex-col items-center justify-center h-56 text-center">
            <div className="p-3 bg-muted rounded-full mb-3">
              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Once you place an order it will appear here.
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
  );
}
