"use client"

import * as React from "react"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters.")
    .max(50, "Category name must be at most 50 characters."),
})

type CategoryFormData = z.infer<typeof formSchema>

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const { setValue } = form

  useEffect(() => {
    const getCategory = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories/${id}`
        )

        const category = await res.json()

        if (res.ok) {
          setValue("name", category.name)
        } else {
          toast.error("Failed to load category", {
            description: category.message || "An error occurred",
          })
        }
      } catch {
        toast.error("Error", {
          description: "Unable to connect to the server to fetch category.",
        })
      }
    }

    if (id) {
      getCategory()
    }
  }, [id, setValue])

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      const result = await res.json()

      if (res.ok) {
        toast.success("Success", {
          description: result.message || "Category updated successfully.",
        })
        router.push("/category-new")
        router.refresh()
      } else {
        toast.error("Failed to update category", {
          description: result.message || "An error occurred",
        })
      }
    } catch {
      toast.error("Error", {
        description: "Unable to connect to the server.",
      })
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 px-4 py-16">
      <Card className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(8,112,184,0.06)] p-6 md:p-8 transition-all duration-300">
        <div className="mb-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/category-new")}
            className="h-9 px-3 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all duration-200 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to categories</span>
          </Button>
        </div>
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Edit Category
          </CardTitle>
          <CardDescription className="text-base text-slate-500 font-medium">
            Modify the category details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-edit-category"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <div className="text-xs font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-2 select-all">
                ID: {id}
              </div>
              <Field data-invalid={form.formState.errors.name ? "true" : undefined}>
                <FieldLabel className="text-sm font-semibold tracking-wide text-slate-700 mb-1.5">
                  Category Name
                </FieldLabel>
                <Input
                  {...form.register("name")}
                  type="text"
                  placeholder="Category name"
                  className="h-12 text-base px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
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
            onClick={() => router.push("/category-new")}
            className="h-12 flex-1 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="form-edit-category"
            className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}