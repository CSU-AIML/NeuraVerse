import { motion } from 'motion/react';

interface EmptyStateProps {
  searchQuery: string;
  isAdmin: boolean;
  onCreateProject: () => void;
}

const EmptyState = ({ searchQuery, isAdmin, onCreateProject }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-slate-700/30 mt-8"
    >
      <div className="p-6 rounded-full bg-slate-800/50 border border-slate-700/30 mb-4">
        <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
      <p className="text-slate-400 text-center max-w-md mb-6">
        {searchQuery ? 
          `We couldn't find any projects matching "${searchQuery}". Try a different search term.` :
          "You haven't created any projects yet. Get started by creating your first project."
        }
      </p>
      
      {isAdmin && !searchQuery && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateProject}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg shadow-blue-900/30 flex items-center space-x-2 font-medium transition-all duration-300 hover:shadow-blue-900/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create New Project</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;