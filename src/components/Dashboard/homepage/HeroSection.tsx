import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import SplitText from '../../ui/SplitText';
import { BackgroundBeams } from '../../ui/background-beams';
import { ColourfulText } from "../../ui/colourful-text";

interface HeroSectionProps {
  isAdmin: boolean;
  onCreateProject: () => void;
  onExploreProjects: () => void;
}

const HeroSection = ({ isAdmin, onCreateProject, onExploreProjects }: HeroSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative text-center mb-16 sm:mb-20 p-8 sm:p-12 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
    >
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-full mb-6"
        >
          <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-sm text-blue-200">Welcome to the Future of AI</span>
        </motion.div>

        <div className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <SplitText
            text="Explore the "
            className="text-white inline-block align-top mr-4"
            delay={50}
            duration={0.4}
            ease="power2.out"
            splitType="chars"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-block font-bold align-top"
          >
            <ColourfulText text="NeuraVerse" />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          A comprehensive platform showcasing innovative AI and machine learning projects. 
          Discover, learn, and collaborate with cutting-edge research and applications that 
          are shaping the future of artificial intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={onExploreProjects}
            className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
          >
            <span>Explore Projects</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {isAdmin && (
            <Button
              onClick={onCreateProject}
              variant="outline"
              className="px-8 py-3 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/30 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105"
            >
              Create New Project
            </Button>
          )}
        </motion.div>
      </div>
      
      {/* Background Beams */}
      <BackgroundBeams />
    </motion.div>
  );
};

export default HeroSection;