interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay = ({ isVisible, message = "Loading projects..." }: LoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700/50 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;