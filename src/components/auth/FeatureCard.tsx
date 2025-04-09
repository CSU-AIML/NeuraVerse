// components/auth/FeatureCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  color 
}) => {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-full bg-${color}/20 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;