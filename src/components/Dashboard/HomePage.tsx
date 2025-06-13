import { motion } from 'motion/react';
import BentoGridSection from './homepage/BentoGridSection';
import TechnologyStackSection from './homepage/TechnologyStackSection';
import CallToActionSection from './homepage/CallToActionSection';
import HeroSection from './homepage/HeroSection';

interface HomePageProps {
  isAdmin: boolean;
  onCreateProject: () => void;
  onExploreProjects: () => void;
}

const HomePage = ({ isAdmin, onCreateProject, onExploreProjects }: HomePageProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl m-4">
      {/* Enhanced Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-slate-900/20 to-purple-900/30 rounded-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent rounded-3xl" />
      
      {/* Additional Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <HeroSection 
            isAdmin={isAdmin}
            onCreateProject={onCreateProject}
            onExploreProjects={onExploreProjects}
          />

          {/* Bento Grid Section */}
          <BentoGridSection />

          {/* Technology Stack Section */}
          <TechnologyStackSection />

          {/* Call to Action Section */}
          <CallToActionSection onExploreProjects={onExploreProjects} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;