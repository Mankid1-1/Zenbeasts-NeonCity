import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
        <div className="text-neon-blue font-mono text-sm animate-pulse">INITIALIZING NEURAL LINK...</div>
      </div>
    </div>
  );
};

export default PageLoader;
