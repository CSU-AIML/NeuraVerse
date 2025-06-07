import { motion } from 'motion/react';
import TextPressure from '../ui/TextPressure';

interface TextPressurePageProps {
  onContinue: () => void;
}

const TextPressurePage = ({ onContinue }: TextPressurePageProps) => {
  return (
    <div className="fixed inset-0 w-full h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 z-30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
      
      {/* Animated Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

      {/* Main TextPressure Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          {/* TextPressure Effect */}
          <div className="w-full h-2/3 flex items-center justify-center">
            <TextPressure
              text="WELCOME TO"
              flex={true}
              alpha={true}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ffffff"
              strokeColor="#3b82f6"
              minFontSize={70}
              className="w-full"
            />
          </div>
          <div className="w-full h-2/3 flex items-center justify-center">
            <TextPressure
              text="NEURAVERSE"
              flex={true}
              alpha={true}
              stroke={false}
              width={true}
              weight={true}
              italic={true}
              textColor="#ffffff"
              strokeColor="#3b82f6"
              minFontSize={50}
              className="w-full"
            />
          </div>

          {/* Subtitle and Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mt-8 space-y-6"
          >
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Experience the power of interactive typography.<br />
              Move your cursor over the text above to see the magic.
            </p>
            
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all duration-300 text-lg"
            >
              <span>Enter NeuraVerse</span>
              <svg 
                className="w-5 h-5 ml-2 inline-block group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-sm text-slate-400 mt-4"
            >
              <p>Hover over the letters to see dynamic font variations</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center text-slate-500 text-sm">
        <div>AI/ML Projects Dashboard</div>
        <div>Interactive Typography Experience</div>
      </div>
    </div>
  );
};

export default TextPressurePage;