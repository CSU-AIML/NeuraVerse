// components/SessionWarning.tsx - Session expiry warning component
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface SessionWarningProps {
  show: boolean;
  countdown: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarning({ show, countdown, onExtend, onLogout }: SessionWarningProps) {
  if (!show) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Expiring Soon
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You will be automatically logged out due to inactivity. Would you like to extend your session?
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Stay Signed In
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}