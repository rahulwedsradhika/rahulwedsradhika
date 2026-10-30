import React, { useEffect } from 'react';
import { InvitationSection } from '../../components/sections/InvitationSection';

export const InvitationPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="space-y-0 animate-in fade-in duration-200 pt-4">
      <InvitationSection />
    </div>
  );
};
