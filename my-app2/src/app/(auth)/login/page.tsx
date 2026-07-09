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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"

const formSchema = z.object({
  email: z
    .string()
    .min(2, "email must be at least 12 characters.")
    .max(32, "email must be at most 32 characters."),
  password: z
    .string()
    .min(8, "password must be at least 8 characters.")
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

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast("Login Successful", {
      description: (
        <pre className="mt-2 rounded-md bg-gray-100 p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-lg rounded-2xl border bg-white shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-3xl font-bold">
            Login
          </CardTitle>

          <CardDescription className="text-lg text-gray-600">
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
                    <FieldLabel className="mb-2 text-lg font-semibold">
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="h-12 text-lg"
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
                    <FieldLabel className="mb-2 text-lg font-semibold">
                      Password
                    </FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter your password"
                      className="h-12 text-lg"
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

        <CardFooter className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="h-12 flex-1 text-lg"
          >
            Reset
          </Button>

          <Button
            type="submit"
            form="form-rhf-demo"
            className="h-12 flex-1 bg-blue-600 text-lg hover:bg-blue-700"
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// export default function Login() {
//   return (
//     <div id="login-form">
//       <h1 id="login-title">Login Form</h1>

//       <form id="login">
//         <div id="form-group">
//           <label id="username-label">Username: </label>
//           <input id="username" type="text" placeholder="Enter your name" />
//         </div>

//         <div id="form-group">
//           <label id="password-label">Password: </label>
//           <input
//             id="password"
//             type="password"
//             placeholder="Enter your Password"
//           />
//         </div>
//         <div id="rememberme">
//           <input id="rememberme-checkbox" type="checkbox" />
//           <label id="rememberme-label">Remember me</label>
//         </div>

//         <button id="submit" type="submit">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// }