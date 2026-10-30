import React, { useEffect } from 'react';
import { VenuesSection } from '../../components/sections/VenuesSection';

export const VenuesPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-0 animate-in fade-in duration-200 pt-4">
      <VenuesSection />
    </div>
  );
};
