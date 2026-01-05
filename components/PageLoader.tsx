import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510]">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-neon-blue rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="mt-4 text-neon-blue font-mono animate-pulse">
          INITIALIZING...
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
