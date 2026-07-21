"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ShoppingBag,
  Loader2,
  XCircle,
} from "lucide-react";

type SyncState = "loading" | "succeeded" | "pending" | "failed";

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { data: session, status: sessionStatus } = useSession();

  const [state, setState] = useState<SyncState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // Wait for session to resolve before making the authenticated call
    if (sessionStatus === "loading") return;

    if (!orderId) {
      setState("succeeded");
      return;
    }

    const token = (session as any)?.accessToken;

    async function syncPaymentStatus() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/payments/${orderId}/status`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data?.message || "Could not verify payment status.");
          setState("failed");
          return;
        }

        const status: string = (data.status || "").toLowerCase();

        if (status === "succeeded" || status === "paid") {
          setState("succeeded");
        } else if (status === "pending") {
          setState("pending");
        } else {
          setState("failed");
          setErrorMsg(`Unexpected payment status: ${status}`);
        }
      } catch {
        setState("failed");
        setErrorMsg("Network error while verifying payment.");
      }
    }

    syncPaymentStatus();
  }, [orderId, session, sessionStatus]);

  /* ── Loading ── */
  if (state === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-semibold">Verifying your payment…</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we confirm your order.
        </p>
      </div>
    );
  }

  /* ── Failed ── */
  if (state === "failed") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="p-5 bg-red-100 dark:bg-red-950/40 rounded-full">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Error</h1>
        <p className="text-muted-foreground max-w-sm">
          {errorMsg ||
            "We could not confirm your payment. Please check My Orders or contact support."}
        </p>
        <Link href="/dashboard/orders">
          <Button className="gap-2 mt-2">
            <ShoppingBag className="h-4 w-4" />
            View My Orders
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Still pending ── */
  if (state === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="p-5 bg-amber-100 dark:bg-amber-950/40 rounded-full">
          <Loader2 className="h-12 w-12 text-amber-600 animate-spin" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Processing</h1>
        <p className="text-muted-foreground max-w-sm">
          Your payment is still being processed. Check My Orders in a few
          minutes for an update.
        </p>
        <Link href="/dashboard/orders">
          <Button className="gap-2 mt-2">
            <ShoppingBag className="h-4 w-4" />
            View My Orders
          </Button>
        </Link>
      </div>
    );
  }

  /* ── Success ── */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="p-5 bg-green-100 dark:bg-green-950/40 rounded-full">
        <CheckCircle2 className="h-14 w-14 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
      <p className="text-muted-foreground max-w-sm">
        Your order has been confirmed and payment received. You can track it in
        My Orders.
      </p>
      {orderId && (
        <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1.5 rounded-md">
          Order ID: {orderId}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/dashboard/orders">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            View My Orders
          </Button>
        </Link>
        <Link href="/dashboard/product">
          <Button variant="outline" className="gap-2">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
