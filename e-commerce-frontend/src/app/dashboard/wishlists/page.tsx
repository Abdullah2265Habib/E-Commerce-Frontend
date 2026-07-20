import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import WishlistssTable from "./_components/wishlist-table";
import WishlistsTable from "./_components/wishlist-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}
export default async function WishlistsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  let products: any[] = [];
  let currentPage = page;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/wishlist?page=${page}&limit=10`,
      {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );



    if (res.ok) {
      const result = await res.json();

      console.log("[dashboard/wishlist] result structure:", Array.isArray(result) ? "Array" : typeof result);

      if (result && Array.isArray(result.data)) {
        products = result.data
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            ...item.productId,
            wishlistItemId: item._id,
          }));
        currentPage = result.page ?? page;
        totalPage = result.totalPages ?? 1;
      }
      else if (Array.isArray(result)) {
        products = result
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            ...item.productId,
            wishlistItemId: item._id,
          }));
        currentPage = page;
        totalPage = 1;
      }
      else if (result && Array.isArray(result.products)) {
        products = result.products
          .filter((item: any) => item.productId)
          .map((item: any) => ({
            ...item.productId,
            wishlistItemId: item._id,
          }));
        currentPage = result.page ?? page;
        totalPage = result.totalPages ?? 1;
      }
    } else {
      console.error("[dashboard/wishlist] fetch failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("[dashboard/product] error:", error);
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <WishlistsTable
        products={products}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </div>
  );
}