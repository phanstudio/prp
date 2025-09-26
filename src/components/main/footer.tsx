// import { Shield } from 'lucide-react';

const Footer = () => {
  return (
    // Footer with Agency Branding
    // <footer className="bg-black backdrop-blur-2xl border-t border-white/20">
    //     <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
    //         <div className="text-center">
    //             <div className="flex items-center justify-center space-x-4 mb-6">
    //                 <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
    //                     <Shield className="w-4 h-4 text-white" />
    //                 </div>
    //                 <span className="text-white font-bold text-lg">CLASSIFIED INVESTIGATION UNIT</span>
    //             </div>
    //             <p className="text-white/60 font-mono text-sm">
    //                 © 2025 • CASE STATUS: CLOSED • THREAT LEVEL: MINIMAL • LEGITIMACY: CONFIRMED
    //             </p>
    //         </div>
    //     </div>
    // </footer>
    <footer className="mt-2 footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
        <aside>
        <p>Copyright © {new Date().getFullYear()} - All right reserved by ACME Industries Ltd</p>
        </aside>
  </footer>
  );
}

export default Footer;