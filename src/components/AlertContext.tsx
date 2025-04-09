import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AlertContainer from './AlertContainer';
import { AlertVariant, AlertPosition } from './EnhancedAlert';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  variant: AlertVariant;
  autoClose?: boolean;
  duration?: number;
}

interface AlertContextType {
  alerts: AlertItem[];
  showAlert: (title: string, message: string, variant: AlertVariant, options?: { autoClose?: boolean; duration?: number }) => void;
  hideAlert: (id: string) => void;
  clearAlerts: () => void;
}

interface AlertOptions {
  autoClose?: boolean;
  duration?: number;
  animation?: string; // Add this property
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
  position?: AlertPosition;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ 
  children,
  position = 'top'
}) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((
    title: string, 
    message: string, 
    variant: AlertVariant, 
    options?: { autoClose?: boolean; duration?: number }
  ) => {
    const id = uuidv4();
    const newAlert: AlertItem = {
      id,
      title,
      message,
      variant,
      autoClose: options?.autoClose !== undefined ? options.autoClose : true,
      duration: options?.duration || 5000
    };
    
    setAlerts(prev => [...prev, newAlert]);
    return id;
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, hideAlert, clearAlerts }}>
      {children}
      <AlertContainer 
        alerts={alerts}
        position={position}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Add some keyframes for animations to your CSS or global styles file
// @keyframes shrink {
//   from { width: 100%; }
//   to { width: 0%; }
// }
// 
// @keyframes slide-down-fade {
//   from { transform: translateY(-20px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
// 
// @keyframes slide-up-fade {
//   from { transform: translateY(20px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }