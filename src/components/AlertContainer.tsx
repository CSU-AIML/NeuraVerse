import React from 'react';
import EnhancedAlert, { AlertVariant, AlertPosition } from './EnhancedAlert';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  variant: AlertVariant;
  autoClose?: boolean;
  duration?: number;
}

interface AlertContainerProps {
  alerts: AlertItem[];
  position?: AlertPosition;
  onClose: (id: string) => void;
}

const AlertContainer: React.FC<AlertContainerProps> = ({ 
  alerts, 
  position = 'top',
  onClose 
}) => {
  const positionClasses = position === 'top' 
    ? 'top-4 right-4' 
    : 'bottom-4 right-4';

  return (
    <div className={`fixed ${positionClasses} z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none`}>
      {alerts.map((alert) => (
        <div key={alert.id} className="pointer-events-auto">
          <EnhancedAlert
            title={alert.title}
            message={alert.message}
            variant={alert.variant}
            position={position}
            autoClose={alert.autoClose !== undefined ? alert.autoClose : true}
            duration={alert.duration || 5000}
            onClose={() => onClose(alert.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default AlertContainer;