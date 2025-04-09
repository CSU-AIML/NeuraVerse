// components/auth/AuthLeftPanel.tsx
import React from 'react';
import { Braces, Server, Users } from 'lucide-react';
import { TypingAnimation } from '../magicui/typing-animation';
import { Ripple } from '../magicui/ripple';
import AppLogo from './AppLogo';
import FeatureCard from './FeatureCard';

const AuthLeftPanel: React.FC = () => {
  return (
    <div className="lg:w-5/12 relative overflow-hidden p-8 flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0b1121] via-[#142241] to-[#0b1121]"></div>
        <div className="absolute blur-3xl opacity-20 top-20 left-20 w-80 h-80 bg-[#3461FF] rounded-full animate-blob"></div>
        <div className="absolute blur-3xl opacity-20 bottom-40 left-40 w-96 h-96 bg-[#5D3FD3] rounded-full animate-blob animation-delay-2000"></div>
        
        {/* Add the Ripple component in the background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Ripple 
            mainCircleSize={300}
            mainCircleOpacity={0.07}
            numCircles={8}
            className="z-[1] [&>div]:!bg-[#3461FF]/10 [&>div]:!border-[#3461FF]/20"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8">
          <AppLogo src="/white_logo.png" alt="NeuraVerse Logo" />
        </div>
        
        {/* Main heading with typing animation */}
        <div className="mb-8">
          <TypingAnimation 
            className="text-3xl font-bold text-white mb-4"
            duration={40}
            as="h1"
          >
            Manage AI/ML Projects with Ease
          </TypingAnimation>
          <p className="text-gray-300 text-lg">
            Your unified platform for developing, deploying, and monitoring AI/ML solutions
          </p>
        </div>
        
        {/* Feature highlights */}
        <div className="space-y-6 mb-auto">
          <FeatureCard 
            icon={<Braces className="w-6 h-6 text-[#3461FF]" />}
            title="Unified Workspace"
            description="Access all your AI/ML projects in one place with integrated tools and services"
            color="[#3461FF]"
          />
          
          <FeatureCard 
            icon={<Server className="w-6 h-6 text-[#5D3FD3]" />}
            title="Seamless Deployment"
            description="Deploy models to production with one click and monitor performance in real time"
            color="[#5D3FD3]"
          />
          
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-[#2D3FFF]" />}
            title="Team Collaboration"
            description="Work together with your team on complex AI/ML projects with version control"
            color="[#2D3FFF]"
          />
        </div>
        
        {/* Footer */}
        <div className="pt-8 mt-6 border-t border-[#3461FF]/20">
          <p className="text-gray-400 text-sm">
            © 2025 NeuraVerse • Your Gateway to AI Development
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;