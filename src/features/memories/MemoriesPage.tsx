import React, { useEffect } from 'react';
import { MemoriesSection } from '../../components/sections/MemoriesSection';

export const MemoriesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-0 animate-in fade-in duration-200 pt-4">
      <MemoriesSection />
    </div>
  );
};
