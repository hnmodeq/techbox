'use client';

import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { gregorianToJalali, formatJalaliDate } from '@/lib/jalali';
import { X } from 'lucide-react';

interface TimelineEventFormProps {
  event?: TimelineEvent | null;
  onClose: () => void;
}

export default function TimelineEventForm({ event, onClose }: TimelineEventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [dateGr, setDateGr] = useState('');
  const [importance, setImportance] = useState(5);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dateFa, setDateFa] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setImage(event.image || '');
      setDateGr(new Date(event.dateGr).toISOString().split('T')[0]);
      setImportance(event.importance);
      setTags(event.tags?.join(', ') || '');
      setDateFa(event.dateFa);
    }
  }, [event]);

  useEffect(() => {
    if (dateGr) {
      const date = new Date(dateGr);
      const jalali = gregorianToJalali(date);
      setDateFa(formatJalaliDate(jalali.year, jalali.month, jalali.day));
    }
  }, [dateGr]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = event ? 'PUT' : 'POST';
      const url = event ? `/api/timeline/events/${event.id}` : '/api/timeline/events';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          image: image || null,
          dateGr,
          dateFa,
          year: new Date(dateGr).getFullYear(),
          yearFa: gregorianToJalali(new Date(dateGr)).year,
          importance,
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div>
        <label className="block text-white mb-2 font-medium">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-slate-800 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-white"
          placeholder="Event title"
        />
      </div>

      <div>
        <label className="block text-white mb-2 font-medium">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="w-full bg-slate-800 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-white"
          placeholder="Description"
        />
      </div>

      <div>
        <label className="block text-white mb-2 font-medium">Image URL</label>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full bg-slate-800 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-2 font-medium">Date *</label>
          <input
            type="date"
            value={dateGr}
            onChange={(e) => setDateGr(e.target.value)}
            required
            className="w-full bg-slate-800 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-white mb-2 font-medium">Solar Hijri</label>
          <input
            type="text"
            value={dateFa}
            disabled
            className="w-full bg-slate-700 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-slate-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-white mb-2 font-medium">Importance: {importance}/10</label>
        <input type="range" min="1" max="10" value={importance} onChange={(e) => setImportance(parseInt(e.target.value))} className="w-full" />
      </div>

      <div>
        <label className="block text-white mb-2 font-medium">Tags</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full bg-slate-800 border-[length:var(--border-size)] border-slate-600 rounded px-3 py-2 text-white"
          placeholder="tag1, tag2"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-medium">
          Cancel
        </button>
      </div>
    </form>
  );
}
