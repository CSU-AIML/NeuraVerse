import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, X, AlertCircle } from 'lucide-react';

export type AlertVariant = 'success' | 'warning' | 'error' | 'info';
export type AlertPosition = 'top' | 'bottom';

interface EnhancedAlertProps {
  title: string;
  message: string;
  variant?: AlertVariant;
  position?: AlertPosition;
  isVisible?: boolean;
  autoClose?: boolean;
  duration?: number;
  onClose?: () => void;
}

const EnhancedAlert: React.FC<EnhancedAlertProps> = ({
  title,
  message,
  variant = 'info',
  position = 'top',
  isVisible = true,
  autoClose = false,
  duration = 5000,
  onClose
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (autoClose && show) {
      timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoClose, duration, show, onClose]);
  
  if (!show) return null;
  
  // Theme variants configuration
  const variantConfig = {
    success: {
      bgGradient: 'from-green-900/30 to-green-800/20',
      border: 'border-green-600/30',
      iconBg: 'bg-green-900/30 border-green-700/30',
      textColor: 'text-green-400',
      icon: <CheckCircle className="w-6 h-6 text-green-400" />
    },
    warning: {
      bgGradient: 'from-amber-900/30 to-amber-800/20',
      border: 'border-amber-600/30',
      iconBg: 'bg-amber-900/30 border-amber-700/30',
      textColor: 'text-amber-400',
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />
    },
    error: {
      bgGradient: 'from-red-900/30 to-red-800/20',
      border: 'border-red-600/30',
      iconBg: 'bg-red-900/30 border-red-700/30',
      textColor: 'text-red-400',
      icon: <AlertCircle className="w-6 h-6 text-red-400" />
    },
    info: {
      bgGradient: 'from-blue-900/30 to-blue-800/20',
      border: 'border-blue-600/30',
      iconBg: 'bg-blue-900/30 border-blue-700/30',
      textColor: 'text-blue-400',
      icon: <Info className="w-6 h-6 text-blue-400" />
    }
  };
  
  const config = variantConfig[variant];
  
  // Position classes
  const positionClasses = position === 'top' 
    ? 'animate-slide-down-fade'
    : 'animate-slide-up-fade';
  
  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };
  
  return (
    <div className={`p-4 md:p-6 bg-gradient-to-r ${config.bgGradient} backdrop-blur-xl rounded-lg border ${config.border} shadow-xl ${positionClasses}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.iconBg} border flex-shrink-0`}>
          {config.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`font-bold text-lg md:text-xl ${config.textColor}`}>{title}</h3>
            <button 
              onClick={handleClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700/50 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="mt-1 text-gray-300">{message}</p>
          
          {autoClose && (
            <div className="mt-3 w-full bg-gray-700/30 rounded-full h-1">
              <div 
                className={`h-1 rounded-full bg-gradient-to-r ${
                  variant === 'success' ? 'from-green-500 to-green-400' : 
                  variant === 'warning' ? 'from-amber-500 to-amber-400' :
                  variant === 'error' ? 'from-red-500 to-red-400' :
                  'from-blue-500 to-blue-400'
                }`}
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAlert;