import React from 'react';
import { Language } from '../../i18n/translations';
import { EnvelopeIntro } from '../envelope/EnvelopeIntro';

interface EntryScreenProps {
  onEnter: (chosenLang: Language) => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return <EnvelopeIntro onEnter={onEnter} />;
};
