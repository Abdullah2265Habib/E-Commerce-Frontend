import Image from "next/image"; 
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample product category mock data
const categories = [
  { id: "CAT001", name: "Electronics", itemsCount: 142, status: "Active" },
  { id: "CAT002", name: "Clothing & Apparel", itemsCount: 89, status: "Active" },
  { id: "CAT003", name: "Home & Kitchen", itemsCount: 0, status: "Inactive" },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8">
      <main className="w-full max-w-4xl bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"> 
        <div className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight">Product Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your store product categories and inventory counts.</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Category ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.status}</TableCell>
                <TableCell className="text-right font-mono">{category.itemsCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  );
}
