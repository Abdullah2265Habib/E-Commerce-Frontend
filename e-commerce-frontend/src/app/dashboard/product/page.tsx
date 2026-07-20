import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductsTable from "./_components/products-table";


interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  let products: any[] = [];
  let currentPage = page;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products?page=${page}&limit=10`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    console.log("[dashboard/product] status:", res.status, "token:", token ? "present" : "missing");

    if (res.ok) {
      const result = await res.json();

      console.log("[dashboard/product] result keys:", Object.keys(result));

      // Handle paginated response: { data: [], page, totalPages }
      if (result && Array.isArray(result.data)) {
        products = result.data;
        currentPage = result.page ?? page;
        totalPage = result.totalPages ?? 1;
      }
      // Handle direct array response (no pagination wrapper)
      else if (Array.isArray(result)) {
        products = result;
        currentPage = page;
        totalPage = 1;
      }
      // Handle nested object e.g. { products: [] }
      else if (result && Array.isArray(result.products)) {
        products = result.products;
        currentPage = result.page ?? page;
        totalPage = result.totalPages ?? 1;
      }
    } else {
      console.error("[dashboard/product] fetch failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("[dashboard/product] error:", error);
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <ProductsTable
        products={products}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </div>
  );
}
