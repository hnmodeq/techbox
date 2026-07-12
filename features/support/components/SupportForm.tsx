"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CheckIcon } from "lucide-react"

const supportSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("ایمیل نامعتبر"),
  subject: z.string().min(5, "عنوان باید حداقل ۵ کاراکتر باشد"),
  message: z.string().min(20, "پیام باید حداقل ۲۰ کاراکتر باشد"),
})

type SupportValues = z.infer<typeof supportSchema>

export function SupportForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const form = useForm<SupportValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  })

  const handleSubmit = async (values: SupportValues) => {
    setStatus("loading")
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        setStatus("success")
        form.reset()
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">پیام شما ارسال شد</h3>
          <p className="text-sm text-muted-foreground mb-4">
            تیم پشتیبانی به زودی پاسخ شما را ارسال خواهد کرد.
          </p>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            ارسال پیام جدید
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام (اختیاری)</FormLabel>
                  <FormControl>
                    <Input placeholder="نام شما" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ایمیل</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان</FormLabel>
                  <FormControl>
                    <Input placeholder="موضوع پیام شما" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>پیام</FormLabel>
                  <FormControl>
                    <Textarea placeholder="توضیحات کامل پیام خود را بنویسید..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status === "error" && (
              <p className="text-sm text-destructive">خطا در ارسال پیام. لطفاً دوباره تلاش کنید.</p>
            )}
            <Button type="submit" className="w-full" loading={status === "loading"}>
              {status === "loading" ? "در حال ارسال..." : "ارسال پیام به پشتیبانی"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
