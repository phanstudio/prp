import { useState } from "react"

export interface TemplateInfo {
  templateName: string
  setTemplateName: (name: string) => void
  templateDescription: string
  setTemplateDescription: (desc: string) => void
  templateTags: string
  setTemplateTags: (tags: string) => void
  resetTemplateInfo: () => void
}

export function useTemplateInfo(initial?: Partial<TemplateInfo>): TemplateInfo {
  const [templateName, setTemplateName] = useState(initial?.templateName ?? "")
  const [templateDescription, setTemplateDescription] = useState(initial?.templateDescription ?? "")
  const [templateTags, setTemplateTags] = useState(initial?.templateTags ?? "")

  const resetTemplateInfo = () => {
    setTemplateName(initial?.templateName ?? "")
    setTemplateDescription(initial?.templateDescription ?? "")
    setTemplateTags(initial?.templateTags ?? "")
  }

  return {
    templateName,
    setTemplateName,
    templateDescription,
    setTemplateDescription,
    templateTags,
    setTemplateTags,
    resetTemplateInfo,
  }
}
