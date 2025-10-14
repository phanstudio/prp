// src/services/templateService.ts
import authService from './authService';
import type { Template, TemplateIn } from '../components/types';
import humps from 'humps';

export default class TemplateService {
  private static axios = authService.getAxiosInstance();

  // Fetch templates from backend
  static async getTemplates(search?: string, skip = 0, limit = 10): Promise<Template[]> {
    try {
      const response = await this.axios.get<Template[]>('/templates', {
        params: { search, skip, limit }
      });
      const data = humps.camelizeKeys(response.data);
      return data.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        textElements: (t.textElements || []).map((el: any) => ({
          ...el,
          // maxFontSize: el.fontSize,
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }
  // Fetch single template by ID
  static async getTemplateById(id: number): Promise<Template | null> {
    try {
      const response = await this.axios.get<Template>(`/templates/${id}`);
      const data: any = humps.camelizeKeys(response.data);

      return {
        ...data,
        createdAt: new Date(data.createdAt),
        textElements: (data.textElements || []).map((el: any) => ({
          ...el,
        })),
      };
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null; // not found
      }
      console.error(`Failed to fetch template ${id}:`, error);
      throw error;
    }
  }

  // Create template with files
  static async saveTemplate(
    template: Omit<Template, 'id' | 'createdAt'| 'imageUrl'| 'thumbnailUrl'>,
    file: File,
    file2: File
  ): Promise<TemplateIn> {
    try {
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', template.name);
      if (template.description) {
        formData.append('description', template.description);
      }
      if (template.tags) {
        formData.append('tag', template.tags.join(", "));
      }
      
      // Convert text_elements to JSON string as expected by FastAPI
      formData.append('text_elements', JSON.stringify(humps.decamelizeKeys(template.textElements)));
      
      // Add files
      formData.append('file', file);
      formData.append('file2', file2);

      const response = await this.axios.post<TemplateIn>('/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        ...response.data,
        created_at: new Date(response.data.created_at)
      };
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }

  // Delete template
  static async deleteTemplate(id: string): Promise<void> {
    try {
      await this.axios.delete(`/templates/${id}`);
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  // Update template
  static async updateTemplate(
    id: string, 
    updates: Partial<Template>,
    // file?: File,
    file2?: File
  ): Promise<any> { // Template
    try {
      const formData = new FormData();
      
      // Add updated fields
      if (updates.name) formData.append('name', updates.name);
      if (updates.description) formData.append('description', updates.description);
      if (updates.tags) formData.append('tag', updates.tags.join(", "));
      if (updates.textElements) {
        formData.append('text_elements', JSON.stringify(humps.decamelizeKeys(updates.textElements)));
      }
      if (updates.imageUrl) formData.append('image_url', updates.imageUrl);
      if (updates.thumbnailUrl) formData.append('thumbnail_url', updates.thumbnailUrl);
      
      // Add files if provided
      if (file2) formData.append('file2', file2);

      // const response = 
      await this.axios.put<any>(`/templates/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // const data = humps.camelizeKeys(response.data);
      // return {
      //   ...data,
      //   createdAt: new Date(data.createdAt)
      // };
      return
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }
}