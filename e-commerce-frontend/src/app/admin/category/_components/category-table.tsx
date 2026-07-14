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

import CreateDialog from "./create-dialog";
import EditDialog from "./edit-dialog";
import DeleteDialog from "./delete-dialog";

interface Category {
  _id: string;
  name: string;
}

interface CategoriesTableProps {
  categories: Category[];
}

export default function CategoriesTable({
  categories,
}: CategoriesTableProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Categories
              </h1>

              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {categories.length} Categories
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your product categories and organize your inventory.
            </p>
          </div>

          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs">
                  Category Name
                </TableHead>

                <TableHead className="text-right uppercase text-xs">
                  Operations
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        {category.name}
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category)}
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
                        No categories found
                      </p>

                      <p className="text-sm">
                        Click "Create Category" to get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <EditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        category={selectedCategory}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={selectedCategory}
      />
    </>
  );
}