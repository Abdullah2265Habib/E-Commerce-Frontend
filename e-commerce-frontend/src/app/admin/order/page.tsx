import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OrdersTable from "./_components/orders-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (res.ok) {
      const result = await res.json();
      orders = result.data || [];
      currentPage = result.page;
      totalPage = result.totalPages;
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <OrdersTable
        orders={orders}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </div>
  );
}
