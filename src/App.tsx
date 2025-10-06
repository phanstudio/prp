// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { TemplateCreatorRoute, GalleryRoute, MemeGeneratorRoute, MemeEditorRoute } from './utilities/router';
import { RegularLayout, AdminLayout } from "./utilities/layouts";
import './App.css';
import './font.css';
import { ToastProvider } from './services/ToastProvider';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Regular user routes - no auth required for viewing */}
            <Route element={<RegularLayout />}>
              <Route path="/" element={<GalleryRoute />} />
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
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

const App: React.FC = () => {
  return <AppRoutes />;
};

export default App;