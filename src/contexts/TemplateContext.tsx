// src/contexts/TemplateContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Template } from "../components/types";

interface TemplateContextType {
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  appendTemplatesPaginated: (newTemplates: Template[]) => void;
  appendTemplate: (newTemplate: Template) => void;
  clearTemplates: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = sessionStorage.getItem("allTemplates");
    return saved ? JSON.parse(saved) : [];
  });

  // keep sessionStorage in sync
  useEffect(() => {
    sessionStorage.setItem("allTemplates", JSON.stringify(templates));
  }, [templates]);

  // // --- Pagination append (multiple) ---
  // const appendTemplatesPaginated = useCallback((newTemplates: Template[]) => {
  //   setTemplates((prev) => {
  //     const existingIds = new Set(prev.map((t) => t.id));
  //     const filtered = newTemplates.filter((t) => !existingIds.has(t.id));
  //     return [...prev, ...filtered];
  //   });
  // }, []);

  // // --- Single append (safe) ---
  // const appendTemplate = useCallback((newTemplate: Template) => {
  //   setTemplates((prev) => {
  //     const exists = prev.some((t) => t.id === newTemplate.id);
  //     if (exists) return prev;
  //     return [...prev, newTemplate];
  //   });
  // }, []);

  // --- Pagination append (replace or add multiple) ---
  const appendTemplatesPaginated = useCallback((newTemplates: Template[]) => {
    setTemplates((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      for (const newT of newTemplates) {
        map.set(newT.id, newT); // replaces if exists, adds if not
      }
      return Array.from(map.values());
    });
  }, []);

  // --- Single append (replace or add one) ---
  const appendTemplate = useCallback((newTemplate: Template) => {
    setTemplates((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      map.set(newTemplate.id, newTemplate); // replaces or adds
      return Array.from(map.values());
    });
  }, []);


  // --- Clear all templates ---
  const clearTemplates = useCallback(() => {
    setTemplates([]);
  }, []);

  return (
    <TemplateContext.Provider
      value={{ templates, setTemplates, appendTemplatesPaginated, appendTemplate, clearTemplates }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider");
  return ctx;
};