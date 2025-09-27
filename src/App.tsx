import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TemplateCreatorRoute, GalleryRoute, MemeGeneratorRoute, MemeEditorRoute } from './utilities/router';
import { RegularLayout, AdminLayout } from "./utilities/layouts";
import './App.css'

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Regular user routes */}
        <Route element={<RegularLayout />}>
          <Route path="/" element={<GalleryRoute />} />
          <Route path="/generator/:templateId" element={<MemeGeneratorRoute />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}> 
        {/* create a protected route for this */}
          <Route index element={<GalleryRoute isAdmin />} /> Admin gallery
          <Route path="creator" element={<TemplateCreatorRoute />} />
          <Route path="edit/:templateId" element={<MemeEditorRoute />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppRoutes />
  );
};

export default App;