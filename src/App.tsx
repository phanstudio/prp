// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TemplateCreatorRoute, GalleryRoute, MemeGeneratorRoute, MemeEditorRoute } from './utilities/router';
import { RegularLayout, AdminLayout } from "./utilities/layouts";
import './App.css';
// Remove the old font.css import - we're using progressive loading now
// import './font.css';
import { ToastProvider } from './services/ToastProvider';
import { TemplateProvider } from "./contexts/TemplateContext";
import { initFontLoader } from './utilities/fontLoader';

const AppRoutes: React.FC = () => {
  // Initialize font loader on app start
  useEffect(() => {
    initFontLoader();
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <TemplateProvider>
            <Routes>
              {/* Public login route */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Regular user routes - no auth required for viewing */}
              <Route element={<RegularLayout />}>
                <Route path="/" element={<GalleryRoute />} />
                <Route path="/about" element={<GalleryRoute />} />
                <Route path="/generator/:templateId" element={<MemeGeneratorRoute />} />
              </Route>

              {/* Admin routes - protected with superuser check */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<GalleryRoute isAdmin />} />
                <Route path="creator" element={<TemplateCreatorRoute />} />
                <Route path="edit/:templateId" element={<MemeEditorRoute />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TemplateProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

const App: React.FC = () => {
  return <AppRoutes />;
};

export default App;