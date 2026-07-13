"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name must be at most 50 characters."),
});

export default function CreateCategory() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (res.ok) {
        toast.success("Success", {
          description: "Category created successfully",
        });
        form.reset();
        router.push("/category");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error("Failed to create category", {
          description: err.message || "An error occurred",
        });
      }
    } catch {
      toast.error("Error", {
        description: "Unable to connect to the server.",
      });
    }
  };

  return (
    <div className="container flex flex-1 items-center justify-center py-10">
      <Card className="w-full max-w-lg">
        {" "}
        <div className="mb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/category")}
            className="h-9 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to categories</span>
          </Button>
        </div>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Category</CardTitle>
          <CardDescription className="text-base text-slate-500 font-medium">
            Add a new product category to your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-create-category"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <Field
                data-invalid={form.formState.errors.name ? "true" : undefined}
              >
                <FieldLabel className="text-sm font-semibold tracking-wide text-slate-700 mb-1.5">
                  Category Name
                </FieldLabel>
                <Input
                  {...form.register("name")}
                  type="text"
                  placeholder="e.g. Electronics, Clothing, Books"
                  className="h-10"
                  aria-invalid={form.formState.errors.name ? "true" : "false"}
                />
                {form.formState.errors.name && (
                  <FieldError errors={[form.formState.errors.name]} />
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="h-12 flex-1 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="form-create-category"
            className="h-12 flex-1 bg-gradient-to-r from-gray-600 to-gray-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
          >
            Create
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
