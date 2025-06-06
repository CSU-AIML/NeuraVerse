import * as React from 'react';

export interface CssSilkProps {
  speed?: number;
  color?: string;
  intensity?: number;
  className?: string;
}

const Silk: React.FC<CssSilkProps> = ({
  speed = 5,
  color = "#7B7481",
  intensity = 1,
  className = ""
}) => {
  const animationDuration = `${20 / speed}s`;
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div 
        className="silk-background"
        style={{
          '--silk-color': color,
          '--silk-intensity': intensity,
          '--animation-duration': animationDuration,
        } as React.CSSProperties}
      />
      
      <style >{`
        .silk-background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: var(--silk-intensity, 1);
          background: 
            radial-gradient(circle at 20% 50%, var(--silk-color, #7B7481) 0%, transparent 70%),
            radial-gradient(circle at 80% 20%, var(--silk-color, #7B7481) 0%, transparent 60%),
            radial-gradient(circle at 40% 80%, var(--silk-color, #7B7481) 0%, transparent 60%),
            radial-gradient(circle at 0% 0%, var(--silk-color, #7B7481) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, var(--silk-color, #7B7481) 0%, transparent 50%),
            linear-gradient(45deg, 
              transparent 0%, 
              var(--silk-color, #7B7481)20 25%, 
              transparent 50%, 
              var(--silk-color, #7B7481)30 75%, 
              transparent 100%
            );
          background-size: 
            200% 200%, 
            300% 300%, 
            250% 250%, 
            180% 180%, 
            220% 220%,
            400% 400%;
          animation: 
            silkFlow1 var(--animation-duration, 4s) ease-in-out infinite,
            silkFlow2 calc(var(--animation-duration, 4s) * 1.3) ease-in-out infinite reverse,
            silkFlow3 calc(var(--animation-duration, 4s) * 0.8) ease-in-out infinite;
        }
        
        .silk-background::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              var(--silk-color, #7B7481)10 4px,
              transparent 6px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 3px,
              var(--silk-color, #7B7481)08 5px,
              transparent 7px
            );
          background-size: 60px 60px, 80px 80px;
          animation: 
            silkPattern calc(var(--animation-duration, 4s) * 2) linear infinite,
            silkShift calc(var(--animation-duration, 4s) * 1.5) ease-in-out infinite alternate;
          opacity: 0.3;
        }
        
        .silk-background::after {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at center, transparent 40%, var(--silk-color, #7B7481)15 100%);
          animation: silkPulse calc(var(--animation-duration, 4s) * 3) ease-in-out infinite;
          opacity: 0.4;
        }

        @keyframes silkFlow1 {
          0%, 100% { 
            background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 50%; 
            transform: translateX(0) translateY(0);
          }
          25% { 
            background-position: 25% 25%, 30% 10%, 15% 35%, 20% 5%, 10% 45%, 25% 25%; 
            transform: translateX(2px) translateY(1px);
          }
          50% { 
            background-position: 50% 50%, 60% 20%, 30% 70%, 40% 10%, 20% 90%, 50% 50%; 
            transform: translateX(0) translateY(2px);
          }
          75% { 
            background-position: 75% 25%, 90% 30%, 45% 35%, 60% 15%, 30% 45%, 75% 75%; 
            transform: translateX(-2px) translateY(1px);
          }
        }

        @keyframes silkFlow2 {
          0%, 100% { 
            background-position: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 50%; 
          }
          33% { 
            background-position: 70% 80%, 80% 90%, 85% 70%, 90% 95%, 80% 60%, 70% 30%; 
          }
          66% { 
            background-position: 40% 60%, 60% 80%, 70% 40%, 80% 90%, 60% 20%, 40% 70%; 
          }
        }

        @keyframes silkFlow3 {
          0%, 100% { 
            filter: hue-rotate(0deg) brightness(1) contrast(1);
          }
          50% { 
            filter: hue-rotate(10deg) brightness(1.1) contrast(1.05);
          }
        }

        @keyframes silkPattern {
          0% { transform: translateX(0) translateY(0) rotate(0deg); }
          100% { transform: translateX(60px) translateY(80px) rotate(360deg); }
        }

        @keyframes silkShift {
          0% { transform: scale(1) skew(0deg); }
          100% { transform: scale(1.02) skew(1deg); }
        }

        @keyframes silkPulse {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
        }
      `}</style>
    </div>
  );
};

export default Silk;