"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

export default function DeleteCategoryPage() {
  const router = useRouter()
  const params = useParams()

  const id = params.id as string

  useEffect(() => {
    const deleteCategory = async () => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this category?"
      )

      if (!confirmDelete) {
        router.push("/category")
        return
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories/${id}`,
          {
            method: "DELETE",
          }
        )

        if (res.ok) {
          toast.success("Category deleted successfully")
          router.push("/category")
          router.refresh()
        } else {
          const error = await res.text()
          toast.error("Failed to delete category", {
            description: error,
          })
          router.push("/category")
        }
      } catch {
        toast.error("Error", {
          description: "Unable to connect to the server.",
        })
        router.push("/category")
      }
    }

    if (id) {
      deleteCategory()
    }
  }, [id, router])

  return (
    <div className="flex-1 flex items-center justify-center p-6 text-slate-500 font-medium">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800">Deleting Category...</h2>
        <p className="text-sm text-slate-400">ID: {id}</p>
      </div>
    </div>
  )
}