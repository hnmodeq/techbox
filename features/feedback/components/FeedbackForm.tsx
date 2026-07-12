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

const feedbackSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("ایمیل نامعتبر").optional(),
  feedback: z.string().min(20, "بازخورد باید حداقل ۲۰ کاراکتر باشد"),
})

type FeedbackValues = z.infer<typeof feedbackSchema>

export function FeedbackForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { name: "", email: "", feedback: "" },
  })

  const handleSubmit = async (values: FeedbackValues) => {
    setStatus("loading")
    try {
      const res = await fetch("/api/feedback", {
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
          <h3 className="text-lg font-bold mb-2">بازخورد شما ثبت شد</h3>
          <p className="text-sm text-muted-foreground mb-4">
            از اینکه نظرات خود را با ما در میان گذاشتید متشکریم.
          </p>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            ارسال بازخورد جدید
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
                  <FormLabel>ایمیل (اختیاری)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@email.com" dir="ltr" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>بازخورد</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="نظرات، پیشنهادات یا انتقادات خود را بنویسید..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {status === "error" && (
              <p className="text-sm text-destructive">خطا در ارسال بازخورد. لطفاً دوباره تلاش کنید.</p>
            )}
            <Button type="submit" className="w-full" loading={status === "loading"}>
              {status === "loading" ? "در حال ارسال..." : "ارسال بازخورد"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
