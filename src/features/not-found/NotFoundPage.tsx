import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { RoyalCrestLogo } from '../../components/common/RoyalCrestLogo';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FFF4F6] text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EBD9DE] shadow-xl space-y-6">
        <div className="flex justify-center">
          <RoyalCrestLogo size="lg" variant="crest" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C76B84]">
            404 · Page Not Found
          </span>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#702C43]">
            {lang === 'hi' ? 'पृष्ठ नहीं मिला' : 'Looking for the Celebration?'}
          </h1>
          <p className="text-xs sm:text-sm text-[#765F68] leading-relaxed">
            {lang === 'hi'
              ? 'राम राम! आप जिस पृष्ठ पर पहुँचे हैं वह उपलब्ध नहीं है। कृपया विवाह उत्सव के मुख्य पृष्ठ पर लौटें।'
              : 'Ram Ram! The page you were looking for is not found. Please return to the wedding celebration.'}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Button to="/" variant="primary" size="md">
            <Home className="w-4 h-4 mr-1.5" />
            <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर जाएँ' : 'Return to Home'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
