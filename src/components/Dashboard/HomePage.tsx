import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Brain, Code, Users, Zap, Globe, Database } from 'lucide-react';
import { Button } from '../ui/button';
import SplitText from '../ui/SplitText';
import ScrollVelocity from '../ui/ScrollVelocity';

interface HomePageProps {
  isAdmin: boolean;
  onCreateProject: () => void;
  onExploreProjects: () => void;
}

const HomePage = ({ isAdmin, onCreateProject, onExploreProjects }: HomePageProps) => {
  const handleAnimationComplete = () => {
    console.log('Title animation completed!');
  };

  const features = [
    {
      icon: Brain,
      title: "AI/ML Showcase",
      description: "Discover cutting-edge artificial intelligence and machine learning projects"
    },
    {
      icon: Code,
      title: "Open Source",
      description: "Access code repositories, documentation, and live demos for each project"
    },
    {
      icon: Users,
      title: "Collaborative",
      description: "Connect with researchers, developers, and AI enthusiasts worldwide"
    },
    {
      icon: Zap,
      title: "Innovation Hub",
      description: "Stay updated with the latest breakthroughs in AI and ML technologies"
    }
  ];

  const stats = [
    { number: "10+", label: "AI Projects" },
    { number: "16+", label: "Researchers" },
    { number: "25+", label: "Technologies" },
    { number: "8/7", label: "Available" }
  ];



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
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20 p-8 sm:p-12 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl"
          >
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
                text="Explore the"
                className="text-white block"
                delay={50}
                duration={0.4}
                ease="power2.out"
                splitType="chars"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
              />
              <SplitText
                text="NeuraVerse"
                className="text-blue-400 block font-bold"
                delay={100}
                duration={0.4}
                ease="power2.out"
                splitType="chars"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
              />
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
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 p-8 rounded-3xl bg-slate-900/50 backdrop-blur-2xl border border-white/20 shadow-xl"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                className="text-center p-6 bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 p-8 rounded-3xl bg-slate-900/50 backdrop-blur-2xl border border-white/20 shadow-xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.6 }}
                className="group p-6 bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Technology Stack with ScrollVelocity */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="text-center p-10 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12">
              Powered by Cutting-Edge Technologies
            </h2>
            
            <div className="relative space-y-8">
              <ScrollVelocity
                texts={['TensorFlow ▸ PyTorch ▸ Scikit-learn ▸ Keras ▸ XGBoost ▸ OpenCV ▸ CUDA ▸ Hugging Face ▸ NumPy ▸ Pandas']}
                velocity={50}
                className="text-4xl sm:text-5xl font-black text-white"
                parallaxClassName="w-full overflow-hidden py-6"
                scrollerClassName="flex whitespace-nowrap"
                damping={50}
                stiffness={400}
                numCopies={3}
              />
              
              <ScrollVelocity
                texts={['React ▸ Next.js ▸ TypeScript ▸ FastAPI ▸ Node.js ▸ PostgreSQL ▸ MongoDB ▸ Supabase ▸ Docker ▸ Kubernetes']}
                velocity={-75}
                className="text-4xl sm:text-5xl font-black text-white"
                parallaxClassName="w-full overflow-hidden py-6"
                scrollerClassName="flex whitespace-nowrap"
                damping={50}
                stiffness={400}
                numCopies={3}
              />
              
              <ScrollVelocity
                texts={['AWS SageMaker ▸ Google Cloud AI ▸ Azure ML ▸ Matplotlib ▸ Jupyter ▸ Apache Spark ▸ Plotly ▸ Seaborn']}
                velocity={60}
                className="text-4xl sm:text-5xl font-black text-white"
                parallaxClassName="w-full overflow-hidden py-6"
                scrollerClassName="flex whitespace-nowrap"
                damping={50}
                stiffness={400}
                numCopies={3}
              />
              
              <ScrollVelocity
                texts={['OpenAI GPT ▸ Anthropic Claude ▸ LangChain ▸ Pinecone ▸ Chroma ▸ FAISS ▸ MLflow ▸ Weights & Biases']}
                velocity={-85}
                className="text-4xl sm:text-5xl font-black text-white"
                parallaxClassName="w-full overflow-hidden py-6"
                scrollerClassName="flex whitespace-nowrap"
                damping={50}
                stiffness={400}
                numCopies={3}
              />
              
              {/* Container-level gradients */}
              <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-900/60 to-transparent pointer-events-none z-10"></div>
              <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-900/60 to-transparent pointer-events-none z-10"></div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;