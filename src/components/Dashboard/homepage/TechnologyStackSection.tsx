import { motion } from 'motion/react';
import ScrollVelocity from '../../ui/ScrollVelocity';

const TechnologyStackSection = () => {
  const technologyRows = [
    {
      texts: ['TensorFlow ▸ PyTorch ▸ Scikit-learn ▸ Keras ▸ XGBoost ▸ OpenCV ▸ CUDA ▸ Hugging Face ▸ NumPy ▸ Pandas'],
      velocity: 50,
    },
    {
      texts: ['React ▸ Next.js ▸ TypeScript ▸ FastAPI ▸ Node.js ▸ PostgreSQL ▸ MongoDB ▸ Supabase ▸ Docker ▸ Kubernetes'],
      velocity: -75,
    },
    {
      texts: ['AWS SageMaker ▸ Google Cloud AI ▸ Azure ML ▸ Matplotlib ▸ Jupyter ▸ Apache Spark ▸ Plotly ▸ Seaborn'],
      velocity: 60,
    },
    {
      texts: ['OpenAI GPT ▸ Anthropic Claude ▸ LangChain ▸ Pinecone ▸ Chroma ▸ FAISS ▸ MLflow ▸ Weights & Biases'],
      velocity: -85,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className="text-center p-10 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">
        Powered by Cutting-Edge Technologies
      </h2>
      
      <div className="relative space-y-8">
        {technologyRows.map((row, index) => (
          <ScrollVelocity
            key={index}
            texts={row.texts}
            velocity={row.velocity}
            className="text-4xl sm:text-5xl font-black text-white"
            parallaxClassName="w-full overflow-hidden py-6"
            scrollerClassName="flex whitespace-nowrap"
            damping={50}
            stiffness={400}
            numCopies={3}
          />
        ))}
        
        {/* Container-level gradients */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900/60 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900/60 to-transparent pointer-events-none z-10"></div>
      </div>
    </motion.div>
  );
};

export default TechnologyStackSection;