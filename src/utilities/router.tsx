import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MemeGenerator } from "../pages/memeGeneratorPage";
import TemplateService from "../components/templateService";
import type { Template } from "../components/types";
import { TemplateCreator } from "../components/templateCreator";
import { TemplateGallery } from "../pages/templateGalleryPage";
import { MemeEditor } from "../components/newMainPage";

// Template Gallery Route Component
export const TemplateGalleryRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: Template) => {
    // Store template in localStorage temporarily for the route
    sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
    navigate(`/generator/${template.id}`);
  };

  const handleCreateTemplate = () => {
    navigate("/creator");
  };

  return (
    <TemplateGallery
      onSelectTemplate={handleSelectTemplate}
      onCreateTemplate={handleCreateTemplate}
      isAdmin={true}
    />
  );
};

// // Template Gallery Route Component
// export const AdminTemplateGalleryRoute: React.FC = () => {
//     const navigate = useNavigate();
  
//     const handleSelectTemplate = (template: Template) => {
//       // Store template in localStorage temporarily for the route
//       sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
//       navigate(`/generator/${template.id}`);
//     };
  
//     const handleCreateTemplate = () => {
//       navigate("/creator");
//     };
  
//     return (
//       // <TemplateGallery
//       //   onSelectTemplate={handleSelectTemplate}
//       //   onCreateTemplate={handleCreateTemplate}
//       // />
//       <TemplateGallery
//         onSelectTemplate={handleSelectTemplate}
//         onCreateTemplate={handleCreateTemplate}
//         isAdmin={true}
//       />
//     );
// };

// Template Creator Route Component
export const TemplateCreatorRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <TemplateCreator onBack={handleBack} />;
};

// Meme Generator Route Component
export const MemeEditorRoute: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (templateId) {
      // Try to get from sessionStorage first (from navigation)
      const sessionTemplate = sessionStorage.getItem("selectedTemplate");
      if (sessionTemplate) {
        const parsedTemplate = JSON.parse(sessionTemplate);
        if (parsedTemplate.id === templateId) {
          setTemplate(parsedTemplate);
          return;
        }
      }

      // Fallback: get from stored templates
      const templates = TemplateService.getTemplates();
      const foundTemplate = templates.find((t) => t.id === templateId);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        // Template not found, redirect to gallery
        navigate("/", { replace: true });
      }
    }
  }, [templateId, navigate]);

  const handleBack = () => {
    // Clean up session storage
    sessionStorage.removeItem("selectedTemplate");
    navigate("/");
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <TemplateCreator onBack={handleBack}  templateToEdit={template}/>;
};


// add a nav bar to go to the libary and the collections

// Meme Generator Route Component
export const MemeGeneratorRoute: React.FC = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (templateId) {
      // Try to get from sessionStorage first (from navigation)
      const sessionTemplate = sessionStorage.getItem("selectedTemplate");
      if (sessionTemplate) {
        const parsedTemplate = JSON.parse(sessionTemplate);
        if (parsedTemplate.id === templateId) {
          setTemplate(parsedTemplate);
          return;
        }
      }

      // Fallback: get from stored templates
      const templates = TemplateService.getTemplates();
      const foundTemplate = templates.find((t) => t.id === templateId);
      if (foundTemplate) {
        setTemplate(foundTemplate);
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [templateId, navigate]);

  if (!template) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <MemeGenerator template={template} />;
};