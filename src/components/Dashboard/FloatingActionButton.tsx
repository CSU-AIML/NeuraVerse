import { motion } from 'motion/react';

interface FloatingActionButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

const FloatingActionButton = ({ isVisible, onClick }: FloatingActionButtonProps) => {
  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.3 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:hidden p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 z-20"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </motion.button>
  );
};

export default FloatingActionButton;