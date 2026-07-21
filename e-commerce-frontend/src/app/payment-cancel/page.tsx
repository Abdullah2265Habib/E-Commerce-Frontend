import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Payment Cancelled",
  description: "Your payment was cancelled. Your cart is still saved.",
};

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="p-5 bg-red-100 dark:bg-red-950/40 rounded-full">
        <XCircle className="h-14 w-14 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
      <p className="text-muted-foreground max-w-sm">
        Your payment was cancelled and you have not been charged. Your cart
        items are still saved — you can retry checkout whenever you&apos;re ready.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link href="/dashboard/cart">
          <Button className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
        <Link href="/dashboard/product">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
