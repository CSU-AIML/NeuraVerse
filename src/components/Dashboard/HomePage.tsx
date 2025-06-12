import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Brain, Code, Users, Zap, Globe, Database, TrendingUp, Clock, Shield, Lightbulb, Rocket, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import SplitText from '../ui/SplitText';
import ScrollVelocity from '../ui/ScrollVelocity';
import { BackgroundBeams } from '../ui/background-beams';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';
import { cn } from '@/lib/utils';

interface HomePageProps {
  isAdmin: boolean;
  onCreateProject: () => void;
  onExploreProjects: () => void;
}

const HomePage = ({ isAdmin, onCreateProject, onExploreProjects }: HomePageProps) => {
  const handleAnimationComplete = () => {
    console.log('Title animation completed!');
  };

  const getItemClassName = (index: number) => {
    const layouts = [
      "md:col-span-2 md:row-span-1", // Production AI Systems - wide horizontal
      "md:col-span-1 md:row-span-2", // Engineer Productivity - tall vertical
      "md:col-span-1 md:row-span-1", // Intelligent Automation - small square
      "md:col-span-1 md:row-span-1", // Real-time Monitoring - small square
      "md:col-span-2 md:row-span-2", // Smart Code Analysis - large hero card
      "md:col-span-1 md:row-span-1", // Predictive Analytics - small square
      "md:col-span-1 md:row-span-1", // Technology Stack - small square
      "md:col-span-3 md:row-span-1", // Innovation Pipeline - super wide
    ];
    return layouts[index] || "";
  };

  const ProjectMetric = ({ value, label, trend, size = "normal" }: { value: string; label: string; trend?: string; size?: "small" | "normal" | "large" }) => {
    const textSizes = {
      small: "text-2xl",
      normal: "text-3xl", 
      large: "text-4xl"
    };
    
    return (
      <div className="flex flex-col items-center p-3 bg-gradient-to-br from-slate-800/60 to-slate-900/40 rounded-lg backdrop-blur-sm border border-slate-600/30">
        <div className={`${textSizes[size]} font-bold text-white mb-1`}>{value}</div>
        <div className="text-sm text-slate-300 text-center leading-tight">{label}</div>
        {trend && <div className="text-xs text-emerald-400 mt-1">{trend}</div>}
      </div>
    );
  };

  const bentoItems = [
    {
      // WIDE HORIZONTAL - Production Focus
      title: "Production AI Systems",
      description: "Live AI/ML models serving thousands of engineering requests daily with enterprise-grade reliability.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900/50 to-indigo-900/40 rounded-lg border border-blue-500/30 p-2">
          <div className="grid grid-cols-2 gap-3 w-full">
            <ProjectMetric value="24" label="Active Models" trend="+3 this month" size="normal" />
            <ProjectMetric value="99.8%" label="Uptime" trend="SLA met" size="normal" />
          </div>
        </div>
      ),
      icon: <Rocket className="h-5 w-5 text-blue-400" />,
    },
    {
      // TALL VERTICAL - Productivity Focus
      title: "Engineer Productivity",
      description: "AI-powered automation tools that have revolutionized daily engineering workflows, eliminating repetitive tasks and accelerating development cycles across all teams.",
      header: (
        <div className="flex flex-col justify-center h-full bg-gradient-to-br from-emerald-900/50 to-teal-900/40 rounded-lg border border-emerald-500/30 p-4">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-emerald-400 mb-3">40%</div>
            <div className="text-lg text-slate-200 font-medium">Time Saved</div>
            <div className="text-sm text-emerald-300 mt-2">Average per engineer</div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Code Reviews</span>
              <span className="text-emerald-400">Automated</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Testing Coverage</span>
              <span className="text-emerald-400">+15%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Deployment Speed</span>
              <span className="text-emerald-400">3x Faster</span>
            </div>
          </div>
        </div>
      ),
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
    },
    {
      // SMALL SQUARE - Compact Info
      title: "Intelligent Automation",
      description: "AI systems handling repetitive tasks 24/7.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900/50 to-violet-900/40 rounded-lg border border-purple-500/30 p-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">156K</div>
            <div className="text-xs text-slate-300">Tasks Automated</div>
            <div className="text-2xl font-bold text-violet-400 mt-2">24/7</div>
            <div className="text-xs text-slate-300">Operations</div>
          </div>
        </div>
      ),
      icon: <Zap className="h-4 w-4 text-purple-400" />,
    },
    {
      // SMALL SQUARE - Real-time Monitoring
      title: "Real-time Monitoring",
      description: "Live system health and performance tracking.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-900/50 to-blue-900/40 rounded-lg border border-indigo-500/30 p-2">
          <div className="text-center w-full">
            <div className="text-3xl font-bold text-indigo-400 mb-1">99.9%</div>
            <div className="text-xs text-slate-300 mb-2">System Health</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">CPU</span>
                <span className="text-green-400">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Memory</span>
                <span className="text-yellow-400">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network</span>
                <span className="text-green-400">Normal</span>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: <Globe className="h-4 w-4 text-indigo-400" />,
    },
    {
      // LARGE HERO CARD - Most Important
      title: "Smart Code Analysis & Security Intelligence",
      description: "Enterprise-grade AI security platform providing comprehensive code analysis, vulnerability detection, and threat intelligence. Our advanced ML models continuously learn from global security patterns, ensuring 99.7% accuracy in threat detection while maintaining minimal false positives for maximum engineering productivity.",
      header: (
        <div className="flex flex-col justify-center h-full bg-gradient-to-br from-red-900/50 to-orange-900/40 rounded-lg border border-red-500/30 p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2">1,247</div>
              <div className="text-sm text-slate-300">Vulnerabilities Detected</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">0.3%</div>
              <div className="text-sm text-slate-300">False Positives</div>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-300">Critical</span>
              <span className="text-red-400 font-bold">23</span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-300">High</span>
              <span className="text-orange-400 font-bold">156</span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-300">Medium</span>
              <span className="text-yellow-400 font-bold">891</span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-slate-300">Low</span>
              <span className="text-blue-400 font-bold">177</span>
            </div>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
            <div className="bg-gradient-to-r from-red-400 to-orange-400 h-3 rounded-full w-[99.7%]"></div>
          </div>
          
          <div className="text-center">
            <span className="text-sm text-slate-400">Real-time Detection Accuracy: </span>
            <span className="text-xl font-bold text-emerald-400">99.7%</span>
          </div>
        </div>
      ),
      icon: <Shield className="h-5 w-5 text-red-400" />,
    },
    {
      // SMALL SQUARE - Analytics
      title: "Predictive Analytics",
      description: "ML models forecasting system performance and failures.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-cyan-900/50 to-blue-900/40 rounded-lg border border-cyan-500/30 p-3">
          <div className="text-center w-full">
            <div className="text-3xl font-bold text-cyan-400 mb-3">94.2%</div>
            <div className="text-sm text-slate-300 mb-3">Accuracy</div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Health</span>
                <span className="text-emerald-400">Optimal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maintenance</span>
                <span className="text-cyan-400">12 days</span>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: <BarChart3 className="h-4 w-4 text-cyan-400" />,
    },
    {
      // SMALL SQUARE - Tech Stack
      title: "Technology Stack",
      description: "AI/ML frameworks powering our solutions.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-800/60 to-slate-900/50 rounded-lg border border-slate-600/30 p-2">
          <div className="grid grid-cols-2 gap-1 w-full">
            {['TensorFlow', 'PyTorch', 'FastAPI', 'React', 'Docker', 'K8s'].map((tech) => (
              <span key={tech} className="px-2 py-1 bg-slate-800/60 text-cyan-300 rounded text-xs border border-cyan-500/30 text-center">
                {tech}
              </span>
            ))}
          </div>
        </div>
      ),
      icon: <Code className="h-4 w-4 text-slate-400" />,
    },
    {
      // SUPER WIDE - Innovation Showcase
      title: "Innovation Pipeline & Research",
      description: "Continuous research and development of breakthrough AI technologies, with regular deployments of experimental features and next-generation capabilities across our engineering ecosystem.",
      header: (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-900/50 to-orange-900/40 rounded-lg border border-amber-500/30 p-4">
          <div className="grid grid-cols-5 gap-6 w-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">8</div>
              <div className="text-sm text-slate-300">In Development</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">5</div>
              <div className="text-sm text-slate-300">Beta Testing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">12</div>
              <div className="text-sm text-slate-300">Released</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">6</div>
              <div className="text-sm text-slate-300">Research</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-1">2M+</div>
              <div className="text-sm text-slate-300">Lines Analyzed</div>
            </div>
          </div>
        </div>
      ),
      icon: <Lightbulb className="h-5 w-5 text-amber-400" />,
    },
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
          {/* Hero Section with Background Beams */}
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
            </div>
            
            {/* Background Beams */}
            <BackgroundBeams />
          </motion.div>

          {/* AI/ML Impact Showcase - Bento Grid */}
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

          {/* Technology Stack with ScrollVelocity */}
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
        </div>
      </div>
    </div>
  );
};

export default HomePage;