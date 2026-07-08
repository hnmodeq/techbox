"use client";

import { useState, useRef, useEffect } from "react";
import { useMentionAutocomplete } from "@/hooks/useMentionAutocomplete";

interface MentionInputProps {
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
}

export default function MentionInput({
  name,
  placeholder = "دیدگاه خود را بنویسید...",
  required = false,
  className = "",
  defaultValue = "",
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  const {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    mentionQuery,
    setMentionQuery,
    cursorPosition,
    setCursorPosition,
    fetchSuggestions,
    insertMention,
  } = useMentionAutocomplete();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    const cursor = e.target.selectionStart || 0;
    setCursorPosition(cursor);

    // Check for @ mention
    const textBeforeCursor = newValue.substring(0, cursor);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      const query = atMatch[1];
      setMentionQuery(query);
      fetchSuggestions(query);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const handleSuggestionClick = (username: string) => {
    if (!textareaRef.current) return;
    insertMention(textareaRef.current, username);
    setValue(textareaRef.current.value);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={handleInput}
        placeholder={placeholder}
        required={required}
        className={`input min-h-[100px] w-full resize-y text-[length:var(--paragraph-font-size)] ${className}`}
        onSelect={(e) => {
          const target = e.target as HTMLTextAreaElement;
          setCursorPosition(target.selectionStart || 0);
        }}
      />

      {/* Mention Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-72 rounded-[var(--corner-radius)] border border-[var(--border-color)] bg-[var(--card-background)] shadow-[var(--shadow-size)] overflow-hidden">
          <div className="px-3 py-2 text-xs paragraph-color border-b border-[var(--border-color)]">
            پیشنهاد کاربران
          </div>
          {suggestions.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSuggestionClick(user.username)}
              className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-[var(--muted-background)] text-right"
            >
              <div className="h-8 w-8 rounded-full bg-[var(--muted-background)] flex items-center justify-center text-sm font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--primary-text)] truncate">
                  {user.name}
                </div>
                <div className="text-xs paragraph-color font-mono" dir="ltr">
                  @{user.username}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
