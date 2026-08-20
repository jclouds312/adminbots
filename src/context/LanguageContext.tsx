import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode; initialLang?: SupportedLanguage }> = ({
  children,
  initialLang = 'es'
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLang);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      language: 'es',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (key: string) => getTranslation(key, 'es')
    };
  }
  return context;
};
