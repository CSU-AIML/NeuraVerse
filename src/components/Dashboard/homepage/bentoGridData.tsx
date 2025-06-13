import { ReactNode } from 'react';
import { Rocket, TrendingUp, Zap, Globe, Shield, BarChart3, Code, Lightbulb } from 'lucide-react';
import ProjectMetric from './ProjectMetric';

export interface BentoItem {
  title: string;
  description: string;
  header: ReactNode;
  icon: ReactNode;
}

export const getItemClassName = (index: number) => {
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

export const bentoItems: BentoItem[] = [
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