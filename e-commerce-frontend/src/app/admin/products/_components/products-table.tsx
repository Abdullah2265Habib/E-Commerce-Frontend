"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
}

export default function ProductsTable({
  products,
  currentPage,
  totalPage,
}: {
  products: Product[];
  currentPage: number;
  totalPage: number;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>

              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {products.length} Products
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your products and organize your inventory.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs">
                  Product Name
                </TableHead>

                <TableHead className="text-right uppercase text-xs">
                  Operations
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        {product.name}
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="h-48 text-center text-base text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-slate-50 rounded-full">
                        <Plus className="w-6 h-6 text-slate-400" />
                      </div>

                      <p className="font-semibold text-slate-600">
                        No products found
                      </p>

                      <p className="text-sm">
                        Click "Product Category" to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => router.push(`?page=${currentPage - 1}`)}
            >
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPage}
            </span>

            <Button
              variant="outline"
              disabled={currentPage === totalPage}
              onClick={() => router.push(`?page=${currentPage + 1}`)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={selectedProduct}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedProduct}
      /> */}
    </>
  );
}
