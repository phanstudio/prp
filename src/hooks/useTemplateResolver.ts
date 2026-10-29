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
    const idStr = String(templateId);

    // 1. Check local context
    const found = templates.find((t) => String(t.id) === idStr);
    if (found) {
      setTemplate(found);
      return;
    }

    // 2. Fetch from backend if not found in current context
    const numId = Number(templateId);
    if (!isNaN(numId)) {
      TemplateService.getTemplateById(numId)
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
  }, [templateId, templates, navigate, fallbackPath, appendTemplate]);

  return template;
}
