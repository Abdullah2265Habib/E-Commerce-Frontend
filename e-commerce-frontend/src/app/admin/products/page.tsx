import ProductsTable from "./_components/products-table";

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {


  const params = await searchParams;

  const page = Number(params.page ?? "1");

  let products = [];
  let currentPage = page;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`,
    );

    if (res.ok) {
      const result = await res.json();

      products = result.data;
      currentPage = result.page;
      totalPage = result.totalPages;
    }
  } catch (error) {
    console.error(error);
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
