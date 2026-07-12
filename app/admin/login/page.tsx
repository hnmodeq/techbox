"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const loginSchema = z.object({
  username: z.string().min(2, "نام کاربری حداقل ۲ کاراکتر").max(50),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(100),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username.trim(), password: values.password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        toast.success("ورود موفق");
        router.push("/admin");
      } else {
        setServerError(data.message || "خطا در ورود");
      }
    } catch {
      setServerError("خطا در برقراری ارتباط با سرور Neon");
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10" dir="rtl">
      <Toaster dir="rtl" />
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">ورود به پنل تکباکس</CardTitle>
          <CardDescription>برای دسترسی به مدیریت وارد شوید</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری</FormLabel>
                    <FormControl>
                      <Input placeholder="username" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" dir="ltr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "در حال ورود..." : "ورود"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
