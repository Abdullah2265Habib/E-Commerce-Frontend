import { Suspense } from "react";
import PaymentSuccessContent from "./_content";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Payment Successful",
  description: "Your payment was successful and your order has been confirmed.",
};

export default function PaymentSuccessPage() {
  return (
      <PaymentSuccessContent />
  );
}
