// pages/UserManagement/ConfirmationModal.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  warningMessage: string;
  confirmLabel: string;
  cancelLabel: string;
  isProcessing: boolean;
  processingLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  warningMessage,
  confirmLabel,
  cancelLabel,
  isProcessing,
  processingLabel,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="bg-gray-900 border border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="bg-gray-800/50 p-4 rounded-lg my-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-amber-300 text-sm">
              {warningMessage}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-500 text-white"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-t-white border-r-white border-b-white border-l-transparent rounded-full animate-spin mr-2"></div>
                {processingLabel}
              </div>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;