// import MainPage from './components/mainpage'
import Footer from './components/main/footer'
// import Header from './components/header'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TemplateCreatorRoute, TemplateGalleryRoute, MemeGeneratorRoute } from './routes/router';

// function App() {
//   return (
//     <div className="min-h-screen">
//       {/* <Header /> */}
//       <MainPage />
//       <Footer />
//     </div>
//   );
// }

// export default App
// Main App Component with Router
const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-base-200 flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<TemplateGalleryRoute />} />
            <Route path="/creator" element={<TemplateCreatorRoute />} />
            <Route path="/generator/:templateId" element={<MemeGeneratorRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;