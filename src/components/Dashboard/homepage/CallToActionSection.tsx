import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../ui/button';

interface CallToActionSectionProps {
  onExploreProjects: () => void;
}

const CallToActionSection = ({ onExploreProjects }: CallToActionSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.8 }}
      className="text-center mt-20 p-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl"
    >
      <h3 className="text-2xl font-bold text-white mb-4">
        Ready to Dive Into AI Innovation?
      </h3>
      <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
        Join our community of AI researchers, developers, and enthusiasts. 
        Explore groundbreaking projects and contribute to the future of artificial intelligence.
      </p>
      <Button
        onClick={onExploreProjects}
        className="group px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
      >
        Start Exploring Now
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </motion.div>
  );
};

export default CallToActionSection;