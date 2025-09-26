import { Shield } from 'lucide-react';
const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">CLASSIFIED</h1>
              <p className="text-xs text-red-400 font-mono">INVESTIGATION UNIT</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;