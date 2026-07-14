import { requireAdmin } from "@/lib/require-admin";
import CategoriesTable from "./_components/category-table";

export default async function CategoriesPage() {
  await requireAdmin();

  let categories = [];
  let currentPage = 1;
  let totalPage = 0;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories?page=1&limit=10`,
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
    console.error("Failed to fetch categories:", error);
  }

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

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Plus, Edit2, Trash2 } from "lucide-react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { requireAdmin } from "@/lib/require-admin";
// export default async function CategoriesPage() {
//   await requireAdmin();
//   let categories = [];
//   try {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`,
//       { cache: "no-store" },
//     );
//     if (res.ok) {
//       categories = await res.json();
//     }
//   } catch (error) {
//     console.error("Failed to fetch categories:", error);
//   }

//   return (
//     <div className="container max-w-5xl mx-auto py-8 space-y-6">
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
//         <div>
//           <div className="flex items-center gap-3">
//             <h1 className="text-3xl font-bold tracking-tight">Categories</h1>

//             <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
//               {Array.isArray(categories) ? categories.length : 0} Categories
//             </span>
//           </div>

//           <p className="mt-1 text-sm text-muted-foreground">
//             Manage your product categories and organize your inventory.
//           </p>
//         </div>

//         <Button>
//           <Link href="/admin/category/create">
//             <Plus className="mr-2 h-4 w-4" />
//             Create Category
//           </Link>
//         </Button>
//       </div>

//       {/* Styled Modern Card & Responsive Table Container */}
//       <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="uppercase text-xs">Category Name</TableHead>
//               <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-slate-500 py-4 px-6">
//                 Operations
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {Array.isArray(categories) && categories.length > 0 ? (
//               categories.map((category: any) => (
//                 <TableRow
//                   key={category._id}
//                   className="hover:bg-muted-50 transition-colors border-b border-slate-100 last:border-0"
//                 >
//                   <TableCell className="font-medium py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-2.5 h-2.5 rounded-full bg-primary" />
//                       <span>{category.name}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-right py-4 px-6">
//                     <div className="flex justify-end items-center gap-2">
//                       <Link href={`./category/edit/${category._id}`}>
//                         <Button variant="outline" size="sm">
//                           <Edit2 className="mr-2 h-4 w-4" />
//                           Edit
//                         </Button>
//                       </Link>

//                       <Link href={`./category/delete/${category._id}`}>
//                         <Button variant="destructive" size="sm">
//                           <Trash2 className="mr-2 h-4 w-4" />
//                           Delete
//                         </Button>
//                       </Link>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={2}
//                   className="h-48 text-center text-base text-slate-400"
//                 >
//                   <div className="flex flex-col items-center justify-center space-y-2">
//                     <div className="p-3 bg-slate-50 rounded-full">
//                       <Plus className="w-6 h-6 text-slate-400" />
//                     </div>
//                     <p className="font-semibold text-slate-600">
//                       No categories found
//                     </p>
//                     <p className="text-sm">
//                       Click "Create Category" to get started.
//                     </p>
//                   </div>
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }
