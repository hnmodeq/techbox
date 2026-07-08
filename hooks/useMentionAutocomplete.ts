"use client";

import { useState, useEffect } from "react";

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

  // In a real app, this would fetch from /api/users/search
  // For now we use a small static list + current user
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    // Mock suggestions (in production: fetch from API)
    const mockUsers: UserSuggestion[] = [
      { id: "1", username: "hoomanmodeq", name: "هومن مدق" },
      { id: "2", username: "atiyehatami", name: "عطیه حاتمی" },
      { id: "3", username: "behnazghaderi", name: "بهناز قادری" },
      { id: "4", username: "farazfeizi", name: "فراز فیضی" },
      { id: "5", username: "nastarankhodakarami", name: "نسترن خداکارمی" },
    ];

    const filtered = mockUsers
      .filter(u => 
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.name.includes(query)
      )
      .slice(0, 6);

    setSuggestions(filtered);
  };

  const insertMention = (
    textarea: HTMLTextAreaElement,
    username: string
  ) => {
    const value = textarea.value;
    const before = value.substring(0, cursorPosition);
    const after = value.substring(cursorPosition);

    // Find the @ position
    const atIndex = before.lastIndexOf("@");
    if (atIndex === -1) return;

    const newValue = 
      before.substring(0, atIndex) + 
      `@${username} ` + 
      after;

    textarea.value = newValue;
    textarea.focus();

    // Set cursor after the mention
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
