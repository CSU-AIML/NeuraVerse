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
    <div className="relative overflow-hidden w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
      {/* Background handled globally by DashboardBackground to remain fixed. */}

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="w-full max-w-[1400px] mx-auto">
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