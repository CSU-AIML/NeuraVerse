import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageModalProps {
  imageUrl?: string;
  imagePath?: string;
  projectName: string;
  className?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  imagePath,
  projectName,
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get the image source URL
  const getImageSrc = () => {
    if (imageUrl) return imageUrl;
    if (imagePath) return imagePath;
    return null;
  };

  const imageSrc = getImageSrc();

  // Reset modal state when opening
  const openModal = () => {
    setIsModalOpen(true);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageError(false);
    setImageLoading(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle keyboard events and wheel events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "Escape":
          closeModal();
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((prev) => Math.min(prev * 1.2, 5));
          break;
        case "-":
          e.preventDefault();
          setZoom((prev) => Math.max(prev / 1.2, 0.1));
          break;
        case "r":
        case "R":
          e.preventDefault();
          setRotation((prev) => (prev + 90) % 360);
          break;
        case "0":
          e.preventDefault();
          setZoom(1);
          setRotation(0);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    // Handle wheel events with non-passive listener to allow preventDefault
    const handleWheelEvent = (e: WheelEvent) => {
      if (!isModalOpen) return;
      
      // Check if the event target is within the modal
      const target = e.target as Element;
      const modalContainer = document.querySelector('[data-modal-container]');
      if (modalContainer && modalContainer.contains(target)) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    if (isModalOpen) {
      document.addEventListener("wheel", handleWheelEvent, { passive: false });
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheelEvent);
    };
  }, [isModalOpen]);

  // Handle mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom functions
  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 5));
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.1));
  const rotate = () => setRotation((prev) => (prev + 90) % 360);
  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Handle image load events
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!imageSrc) {
    return (
      <div
        className={`w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center ${className}`}
      >
        <span className="text-gray-400 text-xs text-center">No Image</span>
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail Image */}
      <div
        className={`relative group ${!imageError ? 'cursor-pointer' : 'cursor-default'} ${className}`}
        onClick={!imageError ? openModal : undefined}
      >
        {!imageError ? (
          <>
            <img
              src={imageSrc}
              alt={projectName}
              className="w-16 h-16 object-cover rounded-lg transition-all duration-300 group-hover:brightness-110"
              onError={() => setImageError(true)}
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-lg flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </>
        ) : (
          <div className="w-16 h-16 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
            <span className="text-gray-400 text-xs text-center">No Image</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative z-10 max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-sm rounded-t-lg border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-white">{projectName}</h3>
                <p className="text-sm text-gray-400">
                  Zoom: {Math.round(zoom * 100)}% | Rotation: {rotation}°
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                
                <button
                  onClick={zoomIn}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                
                <button
                  onClick={rotate}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Rotate (R)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={resetView}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Reset View (0)"
                >
                  Reset
                </button>
                
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors ml-2"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div
              className="flex-1 bg-gray-900/90 backdrop-blur-sm rounded-b-lg overflow-hidden relative"
              style={{ minHeight: "60vh", minWidth: "60vw" }}
              data-modal-container
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {imageLoading && !imageError && (
                  <div className="text-center text-gray-400">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Loading image...</p>
                  </div>
                )}
                
                {!imageError && (
                  <img
                    src={imageSrc}
                    alt={projectName}
                    className={`max-w-none transition-transform duration-200 ${
                      isDragging ? "cursor-grabbing" : "cursor-grab"
                    } ${imageLoading ? "opacity-0" : "opacity-100"}`}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                      userSelect: "none",
                    }}
                    draggable={false}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </div>

              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-400 max-w-md p-6">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <p className="text-lg mb-2">Failed to load image</p>
                    <p className="text-sm mb-4">The image could not be displayed</p>
                    <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-3 text-left">
                      <p><strong>Debug info:</strong></p>
                      <p>URL: {imageSrc}</p>
                      <p>Project: {projectName}</p>
                    </div>
                    <button
                      onClick={() => {
                        setImageError(false);
                        setImageLoading(true);
                      }}
                      className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300">
              <p><strong>Controls:</strong></p>
              <p>• Mouse wheel: Zoom in/out</p>
              <p>• Drag: Pan image</p>
              <p>• +/- keys: Zoom</p>
              <p>• R key: Rotate</p>
              <p>• 0 key: Reset view</p>
              <p>• Esc: Close</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};