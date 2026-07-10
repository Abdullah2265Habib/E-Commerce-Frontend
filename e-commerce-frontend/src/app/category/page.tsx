import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CategoriesPage() {
  let categories = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`,
      { cache: "no-store" }
    );
    if (res.ok) {
      categories = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8 flex-1 w-full">
      {/* Header section with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Categories
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {Array.isArray(categories) ? categories.length : 0} Total
            </span>
          </div>
          <p className="text-base text-slate-500 mt-1.5 font-medium">
            Manage your product categories, structure navigation, and view layouts.
          </p>
        </div>
        
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] rounded-xl px-4 py-2.5 h-auto transition-all duration-200 cursor-pointer">
          <Link href="/category-new/create" className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Category
          </Link>
        </Button>
      </div>

      {/* Styled Modern Card & Responsive Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-slate-500 py-4 px-6">
                Category Name
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-slate-500 py-4 px-6">
                Operations
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category: any) => (
                <TableRow 
                  key={category._id} 
                  className="hover:bg-slate-50/40 transition-colors border-b border-slate-100 last:border-0"
                >
                  <TableCell className="text-base font-semibold text-slate-800 py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />
                      <span>{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <div className="flex justify-end items-center gap-3">
                      <Button variant="outline" className="h-9 px-3.5 text-sm font-semibold border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 rounded-xl transition-all duration-200">
                        <Link href={`./category-new/edit/${category._id}`} className="flex items-center gap-1.5">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                          <span>Edit</span>
                        </Link>
                      </Button>
                      <Button variant="destructive" className="h-9 px-3.5 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100 rounded-xl transition-all duration-200">
                        <Link href={`./category-new/delete/${category._id}`} className="flex items-center gap-1.5">
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-48 text-center text-base text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-slate-50 rounded-full">
                      <Plus className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-600">No categories found</p>
                    <p className="text-sm">Click "Create Category" to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
