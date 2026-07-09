"use client";

import { useState, useRef } from "react";

interface UserSuggestion {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

export function useMentionAutocomplete() {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/mentions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Mention search failed:", err);
      }
    }, 300);
  };

  const insertMention = (
    textarea: HTMLTextAreaElement,
    username: string
  ) => {
    const value = textarea.value;
    const before = value.substring(0, cursorPosition);
    const after = value.substring(cursorPosition);

    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) return;

    const newValue = 
      before.substring(0, atIndex) + 
      `@${username} ` + 
      after;

    textarea.value = newValue;
    textarea.focus();

    const newCursorPos = atIndex + username.length + 2;
    textarea.setSelectionRange(newCursorPos, newCursorPos);

    setShowSuggestions(false);
    setMentionQuery("");
  };

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    mentionQuery,
    setMentionQuery,
    cursorPosition,
    setCursorPosition,
    fetchSuggestions,
    insertMention,
  };
}
