"use client"

import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { toast } from "sonner" 
import { useRouter } from "next/navigation"

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Must be at least 8 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const router = useRouter()
  const onSubmit = async (data: SignupFormValues) => {
    toast.promise(
      async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        })
        if(response.status === 409){
          const result = await response.json()
          setError("email", {
            type: "server",
            message: result.message
          });
          throw new Error("Registration Failed");
        }
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.message || "Failed to create an account.")
        }

        const signInResult = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false, 
        })

        if (signInResult?.error) {
          throw new Error("Account made, but auto-login failed. Please sign in manually.")
        }
        router.push("/login");
        return result
      },
      {
        loading: "Creating your account...",
        success: "Account has been created successfully!",
        error: (err: any) => err.message || "Something went wrong.",
      }
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6 w-full max-w-2xl mx-auto", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>

        {/* Keeping form-level errors for screen accessibility */}
        {errors.root && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20 text-center">
            {errors.root.message}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register("name")}
          />
          {errors.name && (
            <FieldDescription className="text-destructive font-medium">
              {errors.name.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            {...register("email")}
          />
          {errors.email ? (
            <FieldDescription className="text-destructive font-medium">
              {errors.email.message}
            </FieldDescription>
          ) : (
            <FieldDescription>
              We&apos;ll use this to contact you. We will not share your email with anyone else.
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            {...register("password")}
          />
          <FieldDescription className={cn(errors.password && "text-destructive font-medium")}>
            {errors.password ? errors.password.message : "Must be at least 8 characters long."}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldDescription className="text-destructive font-medium">
              {errors.confirmPassword.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button variant="outline" type="button" disabled={isSubmitting}>
            {/* SVG implementation */}
            <svg xmlns="http://w3.org" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <a href="#">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
