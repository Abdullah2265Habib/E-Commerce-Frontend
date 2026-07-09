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
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .max(32, "Username must be at most 32 characters."),
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(5, "Email must be at least 5 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
})

export default function Signup() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("Signup Successful", {
      description: (
        <pre className="mt-2 rounded-md bg-gray-100 p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 px-4 py-16">
      <Card className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(8,112,184,0.06)] p-6 md:p-8 transition-all duration-300">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
            Create an Account
          </CardTitle>
          <CardDescription className="text-base text-slate-500 font-medium">
            Enter your details below to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-signup"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold tracking-wide text-slate-700 mb-1.5">
                      Username
                    </FieldLabel>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your username"
                      className="h-12 text-base px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-sm font-semibold tracking-wide text-slate-700 mb-1.5">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="h-12 text-base px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                      aria-invalid={fieldState.invalid}
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
                    <FieldLabel className="text-sm font-semibold tracking-wide text-slate-700 mb-1.5">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                      className="h-12 text-base px-4 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all duration-200"
                      aria-invalid={fieldState.invalid}
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
            className="h-12 flex-1 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="form-signup"
            className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer"
          >
            Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
