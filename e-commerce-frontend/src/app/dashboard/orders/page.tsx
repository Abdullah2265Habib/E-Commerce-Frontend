import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrdersList from "./_components/orders-list";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export const metadata = {
  title: "My Orders | Dashboard",
  description: "View your full order history, shipment status, and payment details.",
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  let orders: any[] = [];
  let currentPage = page;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders?page=${page}&limit=10`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    console.log("[dashboard/orders] status:", res.status);

    if (res.ok) {
      const result = await res.json();

      if (result && Array.isArray(result.data)) {
        orders = result.data;
        currentPage = result.page ?? page;
        totalPage = result.totalPages ?? 1;
      } else if (Array.isArray(result)) {
        orders = result;
        currentPage = page;
        totalPage = 1;
      }
    } else {
      console.error("[dashboard/orders] fetch failed:", res.status);
    }
  } catch (error) {
    console.error("[dashboard/orders] error:", error);
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <OrdersList
        orders={orders}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </div>
  );
}
