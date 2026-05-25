
import React, { ReactNode, useState, useRef, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  resizable?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', resizable = true }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [sizeDimensions, setSizeDimensions] = useState<{ width: number | string; height: number | string }>({ width: 'auto', height: 'auto' });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset position and size when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      setSizeDimensions({ width: 'auto', height: 'auto' });
    }
  }, [isOpen]);

  // Handle global mouse events for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      } else if (isResizing) {
        const dx = e.clientX - resizeStartPos.current.x;
        const dy = e.clientY - resizeStartPos.current.y;
        setSizeDimensions({
          width: Math.max(300, resizeStartSize.current.width + dx),
          height: Math.max(200, resizeStartSize.current.height + dy)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    if (modalRef.current) {
        const rect = modalRef.current.getBoundingClientRect();
        resizeStartSize.current = { width: rect.width, height: rect.height };
    }
  };

  if (!isOpen) return null;
  
  const sizeClasses: Record<string, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center overflow-hidden"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full m-4 relative flex flex-col max-h-[90vh] ${sizeClasses[size]} ${resizable ? 'resize' : ''}`}
        style={{ 
            transform: `translate(${position.x}px, ${position.y}px)`,
            width: sizeDimensions.width,
            height: sizeDimensions.height
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
            className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 cursor-move bg-slate-50 rounded-t-xl select-none"
            onMouseDown={handleMouseDown}
        >
          <h3 className="text-lg font-semibold text-slate-800 pointer-events-none">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        
        {resizable && (
            <div 
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 text-slate-300 hover:text-slate-500 transition-colors"
                onMouseDown={handleResizeMouseDown}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="2" y2="22"></line>
                    <line x1="22" y1="9" x2="9" y2="22"></line>
                    <line x1="22" y1="16" x2="16" y2="22"></line>
                </svg>
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
