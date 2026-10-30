import React from 'react';
import { useWeddingConfig } from '../../context/WeddingConfigContext';
import { HeroSection } from '../../components/sections/HeroSection';
import { CountdownSection } from '../../components/sections/CountdownSection';
import { HelpSection } from '../../components/sections/HelpSection';

interface HomePageProps {
  burstTrigger?: number;
}

export const HomePage: React.FC<HomePageProps> = ({ burstTrigger = 0 }) => {
  const { config } = useWeddingConfig();
  const nav = config.navigation || {
    hero: true,
    countdown: true,
    help: true,
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-200">
      {nav.hero !== false && <HeroSection burstTrigger={burstTrigger} />}
      {nav.countdown !== false && <CountdownSection />}
      {nav.help !== false && <HelpSection isEntryActive={false} />}
    </div>
  );
};
