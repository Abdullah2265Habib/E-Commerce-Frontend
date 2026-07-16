import { requireAdmin } from "@/lib/require-admin";
import CategoriesTable from "./_components/category-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function CategoriesPage({
  searchParams,
}: PageProps) {
  await requireAdmin();

  const params = await searchParams;

  const page = Number(params.page ?? "1");

  let categories = [];
  let currentPage = page;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories?page=${page}&limit=10`,
      {
        cache: "no-store",
      }
    );

    if (res.ok) {
      const result = await res.json();

      categories = result.data;
      currentPage = result.page;
      totalPage = result.totalPages;
    }
  } catch (error) {
    console.error(error);
  }
  console.log(categories);
  console.log(currentPage);
  console.log(totalPage);
  return (
    <div className="container max-w-5xl mx-auto py-8">
      <CategoriesTable
        categories={categories}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </div>
  );
}