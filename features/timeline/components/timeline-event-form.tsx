'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TimelineEvent } from '@/types/timeline';
import { gregorianToJalali, formatJalaliDate } from '@/lib/jalali';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface TimelineEventFormProps {
  event?: TimelineEvent | null;
  onClose: () => void;
}

const timelineSchema = z.object({
  title: z.string().min(3, 'حداقل ۳ کاراکتر').max(200),
  description: z.string().min(5, 'حداقل ۵ کاراکتر').max(2000),
  image: z.string().url('آدرس تصویر نامعتبر').optional().or(z.literal('')),
  dateGr: z.string().min(1, 'تاریخ الزامی است'),
  importance: z.number().min(1).max(10),
  tags: z.string().max(500).optional(),
});

type TimelineValues = z.infer<typeof timelineSchema>;

export default function TimelineEventForm({ event, onClose }: TimelineEventFormProps) {
  const [dateFa, setDateFa] = React.useState('');

  const form = useForm<TimelineValues>({
    resolver: zodResolver(timelineSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      dateGr: '',
      importance: 5,
      tags: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const dateGrWatch = form.watch('dateGr');
  const importanceWatch = form.watch('importance');

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description,
        image: event.image || '',
        dateGr: new Date(event.dateGr).toISOString().split('T')[0],
        importance: event.importance,
        tags: event.tags?.join(', ') || '',
      });
      setDateFa(event.dateFa);
    }
  }, [event, form]);

  useEffect(() => {
    if (dateGrWatch) {
      const date = new Date(dateGrWatch);
      if (!isNaN(date.getTime())) {
        const jalali = gregorianToJalali(date);
        setDateFa(formatJalaliDate(jalali.year, jalali.month, jalali.day));
      }
    }
  }, [dateGrWatch]);

  const onSubmit = async (values: TimelineValues) => {
    try {
      const method = event ? 'PUT' : 'POST';
      const url = event ? `/api/timeline/events/${event.id}` : '/api/timeline/events';
      const date = new Date(values.dateGr);
      const jalali = gregorianToJalali(date);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          image: values.image || null,
          dateGr: values.dateGr,
          dateFa: dateFa || formatJalaliDate(jalali.year, jalali.month, jalali.day),
          year: date.getFullYear(),
          yearFa: jalali.year,
          importance: values.importance,
          tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      onClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {event ? 'ویرایش رویداد' : 'رویداد جدید'}
          <Badge variant="outline">{dateFa || 'تاریخ شمسی'}</Badge>
        </CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان *</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان رویداد" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>توضیحات *</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="توضیحات" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>آدرس تصویر</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateGr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ میلادی *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label>تاریخ شمسی</Label>
                <Input value={dateFa} disabled placeholder="خودکار از میلادی" />
              </div>
            </div>

            <FormField
              control={form.control}
              name="importance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اهمیت: {importanceWatch}/10</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value as number]}
                      onValueChange={(val: any) => {
                        const v = Array.isArray(val) ? val[0] : val;
                        field.onChange(v);
                      }}
                      className="py-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>برچسب‌ها</FormLabel>
                  <FormControl>
                    <Input placeholder="tag1, tag2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <Separator />
          <CardFooter className="flex gap-2 pt-4">
            <Button type="submit" loading={form.formState.isSubmitting} className="flex-1">
              {form.formState.isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              انصراف
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
