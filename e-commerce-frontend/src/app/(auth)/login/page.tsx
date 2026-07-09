"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

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
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(2, "email must be at least 2 characters.") // Fixed minimum length bug
    .max(32, "email must be at most 32 characters."),
  password: z
    .string()
    .min(5, "password must be at least 5 characters.")
    .max(100, "password must be at most 100 characters."),
})

export default function Login() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Access loading state from react-hook-form
  const { isSubmitting } = form.formState;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // Replace with your actual NestJS API URL (e.g., http://localhost:3000/auth/login)
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Triggers if backend returns 401 Unauthorized or other errors
        throw new Error(result.message || "Failed to log in");
      }

      // 1. Store tokens locally
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("refresh_token", result.refresh_token);

      // 2. Notify User
      toast.success("Login Successful", {
        description: `Welcome back, ${result.user.name || result.user.email}!`,
      });

      // 3. Optional: Redirect your user here (e.g., router.push("/dashboard"))

    } catch (error: any) {
      // Handle server-side errors elegantly
      toast.error("Login Failed", {
        description: error.message || "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 px-4 py-16">
      <Card className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(8,112,184,0.06)] p-6 md:p-8 transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Login
          </CardTitle>
          <CardDescription className="text-base text-slate-500 font-medium">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-rhf-demo"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-base font-semibold tracking-wide text-slate-700 mb-1.5">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="h-12 text-lg px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-base font-semibold tracking-wide text-slate-700 mb-1.5">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      className="h-12 text-lg px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
            className="h-12 flex-1 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={isSubmitting}
            className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
