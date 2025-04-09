// pages/UserManagement/AlertMessage.tsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

interface AlertMessageProps {
  type: 'success' | 'error' | null;
  message: string | null;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
  if (!type || !message) return null;
  
  return (
    <Alert className={`mb-6 ${type === 'success' ? 'bg-green-900/50 border-green-700' : 'bg-red-900/50 border-red-700'}`}>
      {type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <AlertTitle>
        {type === 'success' ? 'Success' : 'Error'}
      </AlertTitle>
      <AlertDescription>
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default AlertMessage;