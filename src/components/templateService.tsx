import type { Template } from './types'

export default class TemplateService {
  private static STORAGE_KEY = 'meme-templates';

  static getTemplates(): Template[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      })) : [];
    } catch {
      return [];
    }
  }

  static saveTemplate(template: Omit<Template, 'id' | 'createdAt'>): Template {
    const templates = this.getTemplates();
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    templates.push(newTemplate);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    return newTemplate;
  }

  static deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  static updateTemplate(id: string, updates: Partial<Template>): void {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    }
  }
}
