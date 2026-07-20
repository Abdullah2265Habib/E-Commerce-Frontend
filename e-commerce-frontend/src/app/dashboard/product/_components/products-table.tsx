"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Package,
  DollarSign,
  Layers,
  BarChart2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AddToCartDialog from "./add-to-cart-dialog";

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setSelectedProduct(product);
    setCartOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <span className="rounded-md border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {products.length} on this page
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse our catalog and add products to your cart.
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          {products.length > 0 ? (
            <Accordion multiple={false} className="w-full">
              {products.map((product, index) => (
                <AccordionItem
                  key={product._id}
                  value={product._id}
                  className={index !== 0 ? "border-t" : ""}
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                    <div className="flex items-center gap-3 text-left flex-1 mr-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0 overflow-hidden border">
                        {product.images && product.images.length > 0 && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="text-green-600 font-medium">${product.price.toFixed(2)}</span>
                          {" · "}
                          <span>{product.stock} in stock</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 hidden sm:flex">
                        {product.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-5 pt-1">
                      {/* Details grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <DollarSign className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Price</p>
                            <p className="text-sm font-semibold text-green-600">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <BarChart2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Stock</p>
                            <p className={`text-sm font-semibold ${product.stock === 0 ? "text-red-500" : "text-blue-600"}`}>
                              {product.stock} units
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <Layers className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Category</p>
                            <p className="text-sm font-semibold">{product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <Package className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Status</p>
                            <p className={`text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                              {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div className="mb-5">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Description</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      )}

                      {/* Product images gallery */}
                      {product.images && product.images.length > 1 && (
                        <div className="mb-5">
                          <p className="text-xs text-muted-foreground font-medium mb-2">Images</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.images.map((img, i) => (
                              <div key={i} className="h-16 w-16 rounded-md overflow-hidden border bg-muted/30">
                                <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end pt-2 border-t">
                        <Button
                          size="sm"
                          disabled={product.stock === 0}
                          onClick={() => handleAddToCart(product)}
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new products.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-6 py-4">
            <Link
              href={`?page=${currentPage - 1}`}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : undefined}
            >
              <Button
                variant="outline"
                disabled={currentPage === 1}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </Link>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPage || 1}
            </span>

            <Link
              href={`?page=${currentPage + 1}`}
              aria-disabled={currentPage >= totalPage}
              tabIndex={currentPage >= totalPage ? -1 : undefined}
            >
              <Button
                variant="outline"
                disabled={currentPage >= totalPage}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AddToCartDialog
        open={cartOpen}
        onOpenChange={setCartOpen}
        product={selectedProduct}
      />
    </>
  );
}
