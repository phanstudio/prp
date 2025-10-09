import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MemeGenerator } from "../pages/memeGeneratorPage";
import type { Template } from "../components/types";
import { TemplateCreator } from "../pages/templateCreatorPage";
import { TemplateGallery } from "../pages/templateGalleryPage";
// import { useTemplates } from "../contexts/TemplateContext";
import { useTemplateResolver } from "../hooks/useTemplateResolver";
import { useImagePreloader } from "../hooks/useImagePreloader";

interface GalleryRouteProps {
  isAdmin?: boolean;
}

export const GalleryRoute: React.FC<GalleryRouteProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();

  const handleSelectTemplate = (template: Template) => {
    navigate(`/generator/${template.id}`);
  };

  const handleEditTemplate = (template: Template) => {
    if (!isAdmin) return;
    navigate(`/admin/edit/${template.id}`);
  };

  const handleCreateTemplate = () => {
    if (!isAdmin) return;
    navigate("/admin/creator");
  };

  return (
    <TemplateGallery
      onSelectTemplate={handleSelectTemplate}
      onEditTemplate={isAdmin ? handleEditTemplate : ()=>{}}
      onCreateTemplate={isAdmin ? handleCreateTemplate : ()=>{}}
      isAdmin={isAdmin}
    />
  );
};

// Template Creator Route Component
export const TemplateCreatorRoute: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin");
  };

  return <TemplateCreator onBack={handleBack} />;
};

// Meme Generator Route
export const MemeGeneratorRoute: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const template = useTemplateResolver(templateId, "/");
  const imgLoaded = useImagePreloader(template?.imageUrl, "/");

  if (!template || !imgLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <MemeGenerator template={template} />;
};

// Meme Editor Route
export const MemeEditorRoute: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const template = useTemplateResolver(templateId, "/admin");
  const imgLoaded = useImagePreloader(template?.imageUrl, "/admin");
  const navigate = useNavigate();

  const handleBack = () => navigate("/admin");

  if (!template || !imgLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return <TemplateCreator onBack={handleBack} templateToEdit={template} />;
};
