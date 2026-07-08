"use client";

import { useState, useEffect } from "react";
import type { ContentItem } from "@/lib/content";

const STORAGE_KEY = "techbox-product-comparison";
const MAX_COMPARE = 4;

export function useProductComparison() {
  const [comparedProducts, setComparedProducts] = useState<ContentItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setComparedProducts(parsed);
        }
      }
    } catch {}
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparedProducts));
    } catch {}
  }, [comparedProducts]);

  const addToComparison = (product: ContentItem) => {
    if (comparedProducts.length >= MAX_COMPARE) {
      alert(`حداکثر ${MAX_COMPARE} محصول قابل مقایسه است`);
      return false;
    }

    const exists = comparedProducts.some(p => p.slug === product.slug);
    if (exists) return false;

    setComparedProducts(prev => [...prev, product]);
    return true;
  };

  const removeFromComparison = (slug: string) => {
    setComparedProducts(prev => prev.filter(p => p.slug !== slug));
  };

  const clearComparison = () => {
    setComparedProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isInComparison = (slug: string) => {
    return comparedProducts.some(p => p.slug === slug);
  };

  return {
    comparedProducts,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    count: comparedProducts.length,
    canAddMore: comparedProducts.length < MAX_COMPARE,
  };
}
