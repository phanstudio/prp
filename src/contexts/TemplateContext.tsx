// src/contexts/TemplateContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Template } from "../components/types";

interface TemplateContextType {
  templates: Template[];
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>(() => {
    // load from sessionStorage if available
    const saved = sessionStorage.getItem("allTemplates");
    return saved ? JSON.parse(saved) : [];
  });

  // sync changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("allTemplates", JSON.stringify(templates));
  }, [templates]);

  return (
    <TemplateContext.Provider value={{ templates, setTemplates }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplates = () => {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplates must be used within TemplateProvider");
  return ctx;
};
