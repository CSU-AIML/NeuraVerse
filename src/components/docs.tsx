import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Sparkles, 
  Code, 
  Settings, 
  Shield, 
  Brain, 
  Terminal, 
  Database, 
  Bot, 
  BookOpen,
  Network,
  Lock,
  Search,
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const Docs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    initial: { scale: 0.96, y: 10, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { scale: 0.96, y: 10, opacity: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.03, transition: { duration: 0.2 } }
  };

  // AI/ML Model cards
  const modelCards = [
    {
      id: "sentinel",
      title: "SentinelAI",
      description: "Advanced threat detection model that identifies anomalous network behavior with 99.7% accuracy",
      icon: <Shield className="text-red-400" size={24} />,
      tag: "Anomaly Detection",
      color: "from-red-500 to-orange-500"
    },
    {
      id: "deeptrack",
      title: "DeepTrack",
      description: "Entity tracking system that correlates attacker identities across multiple intrusion attempts",
      icon: <Search className="text-indigo-400" size={24} />,
      tag: "Entity Tracking",
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: "vulnscan",
      title: "VulnScanGPT",
      description: "Code vulnerability scanner powered by our custom LLM trained on CVE databases",
      icon: <AlertTriangle className="text-yellow-400" size={24} />,
      tag: "LLM",
      color: "from-yellow-500 to-amber-500"
    },
    {
      id: "cybercopilot",
      title: "CyberCopilot",
      description: "AI assistant for security analysts that provides real-time guidance during incident response",
      icon: <Bot className="text-green-400" size={24} />,
      tag: "Assistant",
      color: "from-green-500 to-emerald-500"
    }
  ];

  // Define type for model card items
  interface ModelCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
    color: string;
  }
  
  const ExpandableCard = ({ item }: { item: ModelCard }) => (
    <motion.div
      layoutId={`card-${item.id}`}
      className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-5 border border-gray-700 shadow-lg cursor-pointer"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {item.icon}
          <h3 className="text-xl font-semibold">{item.title}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${item.color} text-white`}>
          {item.tag}
        </span>
      </div>
      <p className="text-gray-300 text-sm">{item.description}</p>
      
      {expanded === item.id && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 text-sm text-gray-300 border-t border-gray-700 pt-4"
        >
          <h4 className="font-semibold text-white mb-2">Integration Example:</h4>
          <pre className="bg-gray-900 p-3 rounded-lg text-xs text-blue-400 overflow-x-auto">
            {`import { ${item.title} } from '@aiml/security-suite';

              // Initialize the model
              const ${item.id} = new ${item.title}({
                sensitivity: 'high',
                alertThreshold: 0.85
              });

              // Process security logs
              const results = await ${item.id}.analyze(securityLogs);`}
          </pre>
          <div className="flex justify-end mt-3">
            <button className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1.5 rounded-full text-white font-medium flex items-center gap-1 hover:from-blue-600 hover:to-purple-700 transition-all">
              View Documentation <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0c1425] to-[#06070d] text-white py-16 px-6 md:px-12 overflow-x-hidden relative">
      {/* Animated background elements */}
      {/* Enhanced animated background elements */}
      
      <div className="absolute inset-0 overflow-hidden">
        {/* Dramatic gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-950/40 via-transparent to-transparent opacity-80"></div>
        
        {/* Digital circuit pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-circuit-pattern"></div>
        </div>
        
        {/* Glowing accent lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70 animate-pulse-slow animation-delay-1000"></div>
        
        {/* Main feature blobs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-cyan-700/30 rounded-full filter blur-3xl opacity-40 animate-slow-drift"></div>
        <div className="absolute top-1/3 right-10 w-120 h-120 bg-gradient-to-tr from-purple-700/25 to-indigo-800/25 rounded-full filter blur-3xl opacity-30 animate-slow-drift-reverse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-bl from-teal-600/20 to-emerald-700/20 rounded-full filter blur-3xl opacity-30 animate-slow-drift animation-delay-3000"></div>
        
        {/* Cybersecurity data visualization elements */}
        <div className="absolute top-40 right-40 opacity-70">
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none" className="opacity-20">
            <circle cx="250" cy="250" r="200" stroke="rgba(37, 99, 235, 0.1)" strokeWidth="1" fill="none" />
            <circle cx="250" cy="250" r="150" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="1" fill="none" />
            <circle cx="250" cy="250" r="100" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="1" fill="none" />
            <circle cx="250" cy="250" r="50" stroke="rgba(37, 99, 235, 0.25)" strokeWidth="1" fill="none" />
            <path d="M250,50 L250,450" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="1" strokeDasharray="10,5" />
            <path d="M50,250 L450,250" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="1" strokeDasharray="10,5" />
            <path d="M120,120 L380,380" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="1" strokeDasharray="10,5" />
            <path d="M120,380 L380,120" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="1" strokeDasharray="10,5" />
          </svg>
        </div>
        
        {/* Animated security radar */}
        <div className="absolute bottom-40 right-20 opacity-70">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="opacity-20">
            <circle cx="150" cy="150" r="120" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" fill="none" />
            <path id="radar-sweep" d="M150,150 L150,30" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2" strokeLinecap="round">
              <animateTransform 
                attributeName="transform" 
                type="rotate" 
                from="0 150 150" 
                to="360 150 150" 
                dur="6s" 
                repeatCount="indefinite" 
              />
            </path>
            <circle cx="150" cy="150" r="5" fill="rgba(16, 185, 129, 0.5)" />
            <circle cx="150" cy="90" r="3" fill="rgba(16, 185, 129, 0.6)" />
            <circle cx="190" cy="180" r="4" fill="rgba(16, 185, 129, 0.5)" />
            <circle cx="80" cy="170" r="3" fill="rgba(16, 185, 129, 0.4)" />
            <circle cx="210" cy="100" r="2" fill="rgba(16, 185, 129, 0.6)" />
          </svg>
        </div>
        
        {/* Glowing particles */}
        <div className="absolute inset-0">
          <div className="stars-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute rounded-full bg-white" 
                style={{ 
                  top: `${Math.random() * 100}%`, 
                  left: `${Math.random() * 100}%`,
                  width: `${Math.max(1, Math.random() * 3)}px`,
                  height: `${Math.max(1, Math.random() * 3)}px`,
                  opacity: Math.random() * 0.5 + 0.2,
                  animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out ${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Hexagon grid pattern - cybersecurity motif */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                <path d="M25 0 L50 14.4 L50 37.4 L25 51.8 L0 37.4 L0 14.4 Z" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)"></rect>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        <motion.button
              onClick={() => window.location.href = '/dashboard'}
              className="group flex items-center gap-3 px-4 py-2 rounded-lg mb-10 bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 hover:border-blue-600/50 text-gray-300 hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: 0 }}
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowLeft className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
              </motion.div>
              <span className="font-medium">Back to Dashboard</span>
            </motion.button>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-block"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-6xl font-extrabold drop-shadow-lg">
              AIML Projects Hub
            </span>
          </motion.div>
          
          <motion.p
            className="text-center text-gray-300 mt-4 text-lg max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Empowering Cybersecurity Teams with Advanced AI/ML Tools for Threat Detection,
            Vulnerability Assessment, and Intelligent Response
          </motion.p>
        </motion.div>

        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-6xl mx-auto mt-12 w-full"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 p-1 rounded-full">
              <TabsTrigger 
                value="overview" 
                className="rounded-full px-5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="rounded-full px-5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI/ML Models
              </TabsTrigger>
              <TabsTrigger 
                value="prompting" 
                className="rounded-full px-5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Prompt Engineering
              </TabsTrigger>
              <TabsTrigger 
                value="integration" 
                className="rounded-full px-5 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all"
              >
                <Database className="w-4 h-4 mr-2" />
                Integration
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="bg-gray-800/40 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700" style={{ maxHeight: 'calc(420vh - 300px)' }}>
            <AnimatePresence mode="wait">
              <TabsContent value="overview" key="overview">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-2">
                      <Sparkles className="text-yellow-400" /> AIML Department Overview
                    </h2>
                    <p className="text-gray-300 mt-3">
                      The AIML Department develops state-of-the-art machine learning solutions specifically designed for cybersecurity operations. 
                      Our tools enable security analysts to detect threats faster, respond more effectively, and stay ahead of evolving attack vectors.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-blue-400">Key Capabilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Shield className="text-blue-400" size={20} />
                          </div>
                          <h4 className="text-lg font-medium">Threat Detection</h4>
                        </div>
                        <p className="text-sm text-gray-300">
                          Advanced anomaly detection models trained on petabytes of network traffic data to identify sophisticated threats with minimal false positives.
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Bot className="text-purple-400" size={20} />
                          </div>
                          <h4 className="text-lg font-medium">AI Assistants</h4>
                        </div>
                        <p className="text-sm text-gray-300">
                          Intelligent assistant models that provide real-time guidance during incident response and automate routine security tasks.
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <Code className="text-green-400" size={20} />
                          </div>
                          <h4 className="text-lg font-medium">Vulnerability Analysis</h4>
                        </div>
                        <p className="text-sm text-gray-300">
                          Code scanning models that detect security vulnerabilities in software and infrastructure as code, with actionable remediation steps.
                        </p>
                      </div>
                      
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-amber-500/20 rounded-lg">
                            <Network className="text-amber-400" size={20} />
                          </div>
                          <h4 className="text-lg font-medium">Predictive Analytics</h4>
                        </div>
                        <p className="text-sm text-gray-300">
                          Forecasting models that predict potential attack vectors based on current threat intelligence and your organization's unique risk profile.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-blue-400">How Our ML Pipeline Works</h3>
                    <div className="relative mt-6 py-4">
                      <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                      
                      {["Data Ingestion", "Preprocessing", "Model Training", "Validation", "Deployment"].map((step, i) => (
                        <div key={step} className="relative mb-8 last:mb-0">
                          <div className={`absolute top-0 left-1/2 w-4 h-4 rounded-full -ml-2 border-2 bg-gray-900 ${i % 2 === 0 ? 'border-blue-500' : 'border-purple-500'}`}></div>
                          <div className={`${i % 2 === 0 ? 'mr-auto pr-12' : 'ml-auto pl-12'} w-5/12 bg-gray-800/60 p-4 rounded-lg border border-gray-700`}>
                            <h4 className="font-medium text-white">{step}</h4>
                            <p className="text-sm text-gray-300 mt-1">
                              {i === 0 && "Security telemetry from endpoints, networks, and applications is collected and anonymized for model training."}
                              {i === 1 && "Raw data is cleaned, normalized, and transformed into feature vectors optimized for machine learning."}
                              {i === 2 && "Models are trained using supervised and unsupervised techniques, with continuous feedback loops from security analysts."}
                              {i === 3 && "Rigorous testing against new threats and comparison with benchmark datasets ensures model efficacy."}
                              {i === 4 && "Models are deployed to production with monitoring for drift detection and scheduled retraining cycles."}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="models" key="models">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
                      <Brain className="text-purple-400" /> AI/ML Models
                    </h2>
                    <p className="text-gray-300 mt-3">
                      Our custom-built machine learning models are specifically designed for cybersecurity use cases. Each model is continuously trained
                      on the latest threat intelligence and can be fine-tuned to your organization's specific environment.
                    </p>
                  </motion.div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
                      {modelCards.map(item => (
                        <ExpandableCard key={item.id} item={item} />
                      ))}
                    </div>

                  <motion.div variants={itemVariants} className="mt-12">
                    <h3 className="text-2xl font-semibold text-purple-400">Model Training Cycle</h3>
                    <div className="mt-4 bg-gray-800/60 p-6 rounded-xl border border-gray-700">
                      <div className="flex flex-wrap justify-between items-center relative">
                        {["Data Collection", "Feature Engineering", "Training", "Evaluation", "Deployment", "Monitoring"].map((phase, i) => (
                          <div key={phase} className="flex flex-col items-center w-1/6 z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${
                              i % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'
                            }`}>
                              <span className="font-bold text-white">{i+1}</span>
                            </div>
                            <p className="text-center text-sm mt-2 font-medium">{phase}</p>
                          </div>
                        ))}
                        {/* Connecting line */}
                        <div className="absolute top-6 left-0 w-full h-px bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
                      </div>
                      
                      <div className="mt-8 text-sm text-gray-300">
                        <p>Our models go through a rigorous development cycle with continuous improvement:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li><span className="text-blue-400 font-medium">Weekly updates</span> based on emerging threats</li>
                          <li><span className="text-blue-400 font-medium">Quarterly retraining</span> with expanded datasets</li>
                          <li><span className="text-blue-400 font-medium">Automated A/B testing</span> for performance improvements</li>
                          <li><span className="text-blue-400 font-medium">Human feedback loops</span> from security analysts</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-10">
                    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-start">
                      <div className="p-2 bg-blue-500/20 rounded-lg mr-4">
                        <Lock className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-300">Model Access & Security</h4>
                        <p className="text-sm text-gray-300 mt-1">
                          All models are hosted within our secure environment and follow strict data handling procedures. 
                          No sensitive data leaves your network perimeter, and all model outputs are logged for auditability.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="prompting" key="prompting">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 flex items-center gap-2">
                      <Terminal className="text-amber-400" /> Prompt Engineering
                    </h2>
                    <p className="text-gray-300 mt-3">
                      Effective prompt engineering is crucial for getting the most out of our AI models. This guide will help you craft prompts
                      that produce accurate, relevant, and actionable security insights.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-amber-400">Prompting Best Practices</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <h4 className="text-lg font-medium mb-2 text-white">Be Specific & Contextual</h4>
                        <div className="space-y-3">
                          <div className="p-3 border border-red-900/50 bg-red-900/20 rounded-lg">
                            <p className="text-sm font-medium text-red-400 mb-1">❌ Ineffective Prompt:</p>
                            <p className="text-xs text-gray-300">"Analyze this log file."</p>
                          </div>
                          <div className="p-3 border border-green-900/50 bg-green-900/20 rounded-lg">
                            <p className="text-sm font-medium text-green-400 mb-1">✅ Effective Prompt:</p>
                            <p className="text-xs text-gray-300">"Analyze this Nginx log file from our production web server for potential SQL injection attempts between 2:00-4:00 AM on March 30."</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <h4 className="text-lg font-medium mb-2 text-white">Use Structured Formats</h4>
                        <div className="space-y-3">
                          <div className="p-3 border border-red-900/50 bg-red-900/20 rounded-lg">
                            <p className="text-sm font-medium text-red-400 mb-1">❌ Ineffective Prompt:</p>
                            <p className="text-xs text-gray-300">"Give me info about this vulnerability."</p>
                          </div>
                          <div className="p-3 border border-green-900/50 bg-green-900/20 rounded-lg">
                            <p className="text-sm font-medium text-green-400 mb-1">✅ Effective Prompt:</p>
                            <p className="text-xs text-gray-300">"Provide a structured analysis of CVE-2023-1234 with: 1) severity rating, 2) affected systems, 3) exploitation methods, 4) recommended mitigations, and 5) detection techniques."</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-2xl font-semibold text-amber-400">Prompt Templates</h3>
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 mt-4">
                        <h4 className="text-lg font-medium mb-3 text-white">Incident Analysis Template</h4>
                        <pre className="bg-gray-900 p-4 rounded-lg text-sm text-amber-300 overflow-x-auto whitespace-pre-wrap">
{`// Incident Analysis Prompt Template

Analyze the following security alert from [SYSTEM_NAME]:

Alert Details:
- Timestamp: [TIMESTAMP]
- Alert ID: [ALERT_ID]
- Source IP: [SOURCE_IP]
- Destination: [DESTINATION]
- Alert Type: [ALERT_TYPE]

Alert Context:
- [PROVIDE RELEVANT CONTEXT ABOUT AFFECTED SYSTEM]
- [INCLUDE ANY RECENT CHANGES OR KNOWN ISSUES]

Please provide:
1. Initial severity assessment
2. Potential false positive indicators
3. Recommended immediate actions
4. Additional data sources to investigate
5. Similar incidents in the last 30 days`}
                        </pre>

                        <div className="flex justify-end mt-4">
                          <button className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-1.5 rounded-full text-white font-medium hover:from-amber-600 hover:to-yellow-600 transition-all">
                            Copy Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-amber-400">Chain of Thought Prompting</h3>
                    <p className="text-gray-300 mt-2">
                      For complex security analyses, guide the model through a step-by-step reasoning process:
                    </p>
                    
                    <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700 mt-4">
                      <ol className="space-y-4 text-sm">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">1</span>
                          <div>
                            <p className="font-medium text-white">Initial observation</p>
                            <p className="text-gray-300 mt-1">
                              "First, examine the HTTP headers in this request and identify any anomalies compared to legitimate traffic."
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">2</span>
                          <div>
                            <p className="font-medium text-white">Intermediate reasoning</p>
                            <p className="text-gray-300 mt-1">
                              "Next, analyze the payload for encoded or obfuscated components that might indicate an attempt to bypass WAF rules."
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">3</span>
                          <div>
                            <p className="font-medium text-white">Contextual evaluation</p>
                            <p className="text-gray-300 mt-1">
                              "Now, consider how this request might interact with the vulnerable component identified in CVE-2023-5678."
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium">4</span>
                          <div>
                            <p className="font-medium text-white">Conclusion & validation</p>
                            <p className="text-gray-300 mt-1">
                              "Finally, determine if this represents a legitimate attack attempt and what indicators would confirm successful exploitation."
                            </p>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent value="integration" key="integration">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 flex items-center gap-2">
                      <Database className="text-green-400" /> Integration & Setup
                    </h2>
                    <p className="text-gray-300 mt-3">
                      Our AIML Platform integrates seamlessly with your existing security stack. Follow these steps to deploy our tools 
                      in your environment.
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-green-400">Getting Started</h3>
                    
                    <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 mt-4">
                      <h4 className="text-lg font-medium text-white mb-4">Installation Steps</h4>
                      
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <Code size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">1. Install Dependencies</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Add our package to your project using npm or yarn:
                            </p>
                            <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-2 overflow-x-auto">
                              npm install @aiml-security/core @aiml-security/models --save
                            </pre>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <Settings size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">2. Configure API Access</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Create a configuration file with your API credentials:
                            </p>
                            <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-2 overflow-x-auto">
{`// aiml.config.js
module.exports = {
  apiKey: "YOUR_API_KEY",
  endpoint: "https://aiml-api.company.com/v1",
  models: ["sentinel", "vulnscan"],
  logLevel: "info"
}`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <Brain size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">3. Initialize Models</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Import and initialize the models in your application:
                            </p>
                            <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-2 overflow-x-auto">
{`import { SentinelAI, VulnScanGPT } from '@aiml-security/models';
import config from './aiml.config.js';

// Initialize models
const sentinel = new SentinelAI({
  apiKey: config.apiKey,
  endpoint: config.endpoint,
  sensitivity: 'high'
});

const vulnscan = new VulnScanGPT({
  apiKey: config.apiKey,
  endpoint: config.endpoint,
  targetLanguages: ['javascript', 'python', 'go']
});`}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">4. Test Connection</p>
                            <p className="text-sm text-gray-300 mt-1">
                              Verify your setup with a simple test:
                            </p>
                            <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-2 overflow-x-auto">
{`async function testConnection() {
  try {
    const status = await sentinel.checkStatus();
    console.log("Connection successful:", status);
    
    // Test a simple detection
    const result = await sentinel.analyzeSample();
    console.log("Sample analysis:", result);
  } catch (error) {
    console.error("Connection failed:", error);
  }
}

testConnection();`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="mt-8">
                    <h3 className="text-2xl font-semibold text-green-400">Integration Examples</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                          <Shield className="text-green-400" size={18} />
                          SIEM Integration
                        </h4>
                        <p className="text-sm text-gray-300">
                          Connect our models to your SIEM system for enhanced alert enrichment and automated triage:
                        </p>
                        <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-3 overflow-x-auto">
{`// Splunk integration example
import { CyberCopilot } from '@aiml-security/models';
import { SplunkConnector } from '@aiml-security/integrations';

const copilot = new CyberCopilot({...});
const splunk = new SplunkConnector({
  host: 'splunk.company.com',
  token: process.env.SPLUNK_TOKEN,
  index: 'security_alerts'
});

// Enrich Splunk alerts with AI analysis
async function enrichAlerts() {
  const alerts = await splunk.getRecentAlerts({
    query: 'severity=critical',
    limit: 10
  });
  
  for (const alert of alerts) {
    const analysis = await copilot.analyzeAlert(alert);
    await splunk.updateAlert(alert.id, {
      aiAnalysis: analysis,
      recommendedActions: analysis.recommendations
    });
  }
}`}
                        </pre>
                      </div>
                      
                      <div className="bg-gray-800/60 p-5 rounded-xl border border-gray-700">
                        <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                          <Terminal className="text-green-400" size={18} />
                          CI/CD Pipeline Integration
                        </h4>
                        <p className="text-sm text-gray-300">
                          Integrate vulnerability scanning directly into your development workflow:
                        </p>
                        <pre className="bg-gray-900 p-3 rounded-lg text-xs text-green-400 mt-3 overflow-x-auto">
{`// GitHub Actions workflow example
name: AIML Security Scan

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install AIML Scanner
        run: npm install -g @aiml-security/scanner
      
      - name: Run Vulnerability Scan
        run: |
          aiml-scan --source=. \\
            --output=report.json \\
            --severity=medium \\
            --api-key=$\{process.env.AIML_API_KEY\}
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: report.json`}
                        </pre>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={itemVariants} 
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center gap-2">
                        <Database className="text-emerald-400" /> 
                        Available SDKs & APIs
                      </h3>
                      <div className="bg-emerald-900/30 border border-emerald-800/50 rounded-full px-3 py-1.5 text-xs font-medium text-emerald-300">
                        Enterprise Support Available
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mt-2 mb-6">
                      Our suite of SDKs and APIs makes integration simple across multiple technology stacks and programming languages.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mt-6">
                      {[
                        { name: "JavaScript/TypeScript", icon: "js", features: ["Browser & Node.js", "React Components", "Async Streaming"], color: "from-yellow-500 to-amber-600" },
                        { name: "Python", icon: "py", features: ["Jupyter Integration", "NumPy/Pandas Support", "Async Capabilities"], color: "from-blue-500 to-indigo-600" },
                        { name: "Go", icon: "go", features: ["High Performance", "Concurrency", "Low Memory Usage"], color: "from-cyan-500 to-blue-600" },
                        { name: "Java", icon: "java", features: ["Spring Boot Support", "Enterprise Ready", "JVM Optimized"], color: "from-orange-500 to-red-600" },
                        { name: "C#/.NET", icon: "cs", features: [".NET Core & Framework", "Azure Integration", "LINQ Support"], color: "from-purple-500 to-violet-600" },
                        { name: "Ruby", icon: "rb", features: ["Rails Integration", "Elegant Syntax", "Background Jobs"], color: "from-red-500 to-pink-600" },
                        { name: "REST API", icon: "api", features: ["OpenAPI Spec", "Rate Limiting", "JWT Auth"], color: "from-green-500 to-emerald-600" },
                        { name: "GraphQL API", icon: "gql", features: ["Query Flexibility", "Schema Introspection", "Subscriptions"], color: "from-pink-500 to-purple-600" }
                      ].map(sdk => (
                        <motion.div 
                          key={sdk.name} 
                          className="bg-gray-800/60 rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 hover:translate-y-[-4px]"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`h-2 bg-gradient-to-r ${sdk.color}`}></div>
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${sdk.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                {sdk.icon}
                              </div>
                              <span className="text-white font-semibold">{sdk.name}</span>
                            </div>
                            
                            <ul className="space-y-1.5 mt-3">
                              {sdk.features.map(feature => (
                                <li key={feature} className="text-xs text-gray-300 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            
                            <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-xs py-1.5 rounded-md transition-colors text-gray-200 flex items-center justify-center gap-1">
                              <Code size={12} />
                              View Documentation
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-8 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/50 rounded-xl p-6 shadow-lg">
                      <div className="flex items-start">
                        <div className="p-3 bg-blue-500/20 rounded-lg mr-4 flex-shrink-0">
                          <BookOpen className="text-blue-300" size={24} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-300 text-lg mb-2">Complete Documentation & Resources</h4>
                          <p className="text-gray-300">
                            Access comprehensive guides, API references, sample projects, and security best practices through our developer portal.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-800/30 hover:bg-blue-700/40 rounded-lg transition-colors group">
                              <Terminal size={16} className="text-blue-400" />
                              <span className="text-sm text-gray-200 group-hover:text-white">API Reference</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-800/30 hover:bg-blue-700/40 rounded-lg transition-colors group">
                              <BookOpen size={16} className="text-blue-400" />
                              <span className="text-sm text-gray-200 group-hover:text-white">Tutorials</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-blue-800/30 hover:bg-blue-700/40 rounded-lg transition-colors group">
                              <Code size={16} className="text-blue-400" />
                              <span className="text-sm text-gray-200 group-hover:text-white">Code Samples</span>
                            </a>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-blue-800/50 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Need help with integration? Contact our developer support team.</span>
                            <button className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md text-white text-xs font-medium transition-colors">
                              <span>Visit Developer Portal</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </ScrollArea>
        </Tabs>

        <motion.div
          className="mt-12 max-w-6xl mx-auto px-6 py-8 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Ready to Get Started?</h3>
              <p className="text-gray-300 mt-2">Request access to the AIML security platform and harness the power of AI for your cybersecurity operations.</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all transform hover:scale-105">
                Request Access
              </button>
              <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>

        {/* CSS for the animated background blobs */}
        <style>{`
          /* Background animations */
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          
          @keyframes slow-drift {
            0% { transform: translate(0px, 0px); }
            25% { transform: translate(15px, -15px); }
            50% { transform: translate(0px, -30px); }
            75% { transform: translate(-15px, -15px); }
            100% { transform: translate(0px, 0px); }
          }
          
          @keyframes slow-drift-reverse {
            0% { transform: translate(0px, 0px); }
            25% { transform: translate(-15px, 15px); }
            50% { transform: translate(0px, 30px); }
            75% { transform: translate(15px, 15px); }
            100% { transform: translate(0px, 0px); }
          }
          
          .animate-slow-drift {
            animation: slow-drift 20s ease-in-out infinite;
          }
          
          .animate-slow-drift-reverse {
            animation: slow-drift-reverse 20s ease-in-out infinite;
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-3000 {
            animation-delay: 3s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          .animation-delay-5000 {
            animation-delay: 5s;
          }
          
          .animate-ping-slow {
            animation: ping 5s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes ping {
            0% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.2); opacity: 0.3; }
            100% { transform: scale(1); opacity: 0.2; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.8; }
          }
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.7; }
          }
          
          .bg-grid-pattern {
            background-image: linear-gradient(to right, rgba(30, 64, 175, 0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(30, 64, 175, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          
          .bg-circuit-pattern {
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='rgba(59, 130, 246, 0.5)' stroke-width='0.5'/%3E%3Cpath d='M10 50h80M50 10v80' stroke='rgba(59, 130, 246, 0.3)' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='10' cy='10' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='10' cy='50' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='10' cy='90' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='50' cy='10' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='50' cy='90' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='90' cy='10' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='90' cy='50' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3Ccircle cx='90' cy='90' r='2' fill='rgba(59, 130, 246, 0.5)'/%3E%3C/svg%3E");
          }
        `}</style>
      </div>
    </div>
  );
};

export default Docs;