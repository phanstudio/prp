// src/hooks/useTemplateResolver.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTemplates } from "../contexts/TemplateContext";
import type { Template } from "../components/types";
import TemplateService from "../services/templateService";

export function useTemplateResolver(templateId?: string, fallbackPath: string = "/") {
  const { templates, appendTemplate } = useTemplates();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (!templateId) return;
    const id = Number(templateId);

    // 1. check local context
    const found = templates.find((t) => t.id === id);
    if (found) {
      setTemplate(found);
      return;
    }

    // 2. fallback: fetch from backend if no templates in context
    if (templates.length === 0) {
      TemplateService.getTemplateById(id)
        .then((data) => {
          if (data) {
            setTemplate(data);
            appendTemplate(data);
          } else {
            navigate(fallbackPath, { replace: true });
          }
        })
        .catch(() => navigate(fallbackPath, { replace: true }));
    } else {
      navigate(fallbackPath, { replace: true });
    }
  }, [templateId, templates, navigate, fallbackPath]);

  return template;
}
