import { motion } from 'motion/react';
import { BentoGrid, BentoGridItem } from '../../ui/bento-grid';
import { bentoItems, getItemClassName } from './bentoGridData';

const BentoGridSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.8 }}
      className="mb-20"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Transforming Engineering with AI
        </h2>
        <p className="text-lg text-slate-300 max-w-3xl mx-auto">
          Our AI/ML department delivers intelligent solutions that enhance productivity, 
          ensure security, and drive innovation across all engineering teams.
        </p>
      </div>
      
      <div className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-2xl border border-white/20 shadow-xl">
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[16rem] md:grid-cols-3">
          {bentoItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1, duration: 0.6 }}
              className={getItemClassName(i)}
            >
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className="bg-slate-900/60 backdrop-blur-xl border-white/10 hover:border-blue-500/30 transition-all duration-300 h-full"
              />
            </motion.div>
          ))}
        </BentoGrid>
      </div>
    </motion.div>
  );
};

export default BentoGridSection;