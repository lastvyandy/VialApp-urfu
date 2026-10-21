import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

const CATEGORY_EN_MAP = {
  'Todas': 'All Categories',
  'Mixto': 'Mixed (Full Exam)',
  'Express (10 Preguntas)': 'Express (10 Questions)',
  'Normas y Señalización del Tránsito': 'Traffic Rules & Signs',
  'Funcionamiento y Mantenimiento del Vehículo': 'Vehicle Mechanics & Maintenance',
  'La Persona en el Tránsito y Convivencia Vial': 'Road Safety & Coexistence',
  'Siniestros de Tránsito, Factores de Riesgo y Primeros Auxilios': 'Accidents, Risk Factors & First Aid',
  'Conducción Eficiente y Medio Ambiente': 'Eco-Driving & Environment',
  'Otros Temas del Tránsito': 'Other Traffic Topics',
  'Seguridad vial': 'Road Safety',
  'Conducción segura': 'Safe Driving',
  'Mecánica del vehículo': 'Vehicle Mechanics',
  'Elementos de seguridad': 'Safety Elements',
  'Normas de circulación': 'Traffic Regulations',
  'Física aplicada a la conducción': 'Driving Physics',
  'Conducción en condiciones difíciles': 'Adverse Conditions',
  'Factores humanos': 'Human Factors',
  'Convivencia vial': 'Road Coexistence',
  'Conducción sostenible': 'Sustainable Driving',
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('vialapp_lang') || 'en');

  const setLang = (newLang) => {
    localStorage.setItem('vialapp_lang', newLang);
    setLangState(newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es');
  };

  const tr = (esText, enText) => (lang === 'en' ? enText : esText);

  const trCategory = (cat) => {
    if (!cat) return '';
    if (lang === 'es') return cat;
    return CATEGORY_EN_MAP[cat] || cat;
  };

  const trLicense = (lic) => {
    if (!lic) return '';
    if (lang === 'es') return lic;
    return String(lic).replace(/Clase/g, 'Class');
  };

  const trExamName = (name) => {
    if (!name) return '';
    if (lang === 'es') return name;
    return String(name)
      .replace('Ensayo Oficial', 'Official Mock Exam')
      .replace('Simulacro Express', 'Express Mock Exam')
      .replace('Clase', 'Class');
  };

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggleLang, tr, trCategory, trLicense, trExamName }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);