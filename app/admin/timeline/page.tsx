'use client';

import React, { useState, useEffect } from 'react';
import { TimelineEvent } from '@/types/timeline';
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react';
import { getJalaliDateStringPersian } from '@/lib/jalali';
import TimelineEventForm from '@/features/timeline/components/timeline-event-form';

export default function AdminTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const response = await fetch('/api/timeline/events');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/timeline/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents();
  }

  if (isLoading) return <div className="p-8 text-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Timeline Management</h1>
            <p className="text-slate-400">Add and edit technology events</p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-[var(--corner-radius)] transition-colors"
          >
            <Plus size={20} />
            New Event
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-slate-900 rounded-[var(--corner-radius)] p-6 border-[length:var(--border-size)] border-slate-700">
            <TimelineEventForm
              event={editingEvent}
              onClose={handleFormClose}
            />
          </div>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-[var(--corner-radius)] border-[length:var(--border-size)] border-slate-700">
              <p className="text-slate-400 mb-4">No events found</p>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="bg-slate-900 border-[length:var(--border-size)] border-slate-700 rounded-[var(--corner-radius)] overflow-hidden hover:border-blue-500 transition-colors"
              >
                <div
                  onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-800/50"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                    <p className="text-sm text-blue-400">
                      {getJalaliDateStringPersian(new Date(event.dateGr))}
                    </p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform ${
                      expandedId === event.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {expandedId === event.id && (
                  <div className="border-t-[length:var(--border-size)] border-slate-700 p-4 bg-slate-800/30">
                    <p className="text-slate-300 mb-4">{event.description}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setShowForm(true);
                        }}
                        className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
