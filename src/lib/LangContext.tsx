import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LangKey, T } from '../constants/translations';

interface LangContextType {
  lang: LangKey;
  setLang: (lang: LangKey) => void;
  t: T;
}

const LangContext = createContext<LangContextType>({
  lang: 'no',
  setLang: () => {},
  t: translations.no,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangKey>('no');

  useEffect(() => {
    AsyncStorage.getItem('lang').then((stored) => {
      if (stored === 'en' || stored === 'no') setLangState(stored);
    });
  }, []);

  const setLang = async (l: LangKey) => {
    setLangState(l);
    await AsyncStorage.setItem('lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
